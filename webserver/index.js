const e = require("express"),
    app = e(),
    bodyParser = require("body-parser"),
    ejs = require("ejs"),
    passport = require("passport"),
    dStrategy = require("passport-discord").Strategy,
    cookieparser = require("cookie-parser"),
session = require("express-session"),
appstore = require("express-session-rethinkdb")(session),
store = new appstore({
    connectOptions: {
        db:"ttalpha"
    }
});
app.enable("trust proxy");
app.use(bodyParser.urlencoded({
    extended: true,
    parameterLimit: 10000,
    limit: "5mb"
}));
app.use(bodyParser.json({
    parameterLimit: 10000,
    limit: "5mb"
}));
app.set("json spaces", 2);

app.engine("ejs", ejs.renderFile);
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

var scopes = ['identify'];

passport.use(new dStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: `http://${config.webserverip || "127.0.0.1"}:8090/callback`,
    scope: scopes
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

app.use(session({
    secret: config.clientSecret,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(cookieparser())
app.use(passport.initialize());
app.use(passport.session());
app.get('/login', checkAuthNeg, passport.authenticate('discord', { scope: scopes }), function (req, res) { });
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function (req, res) { res.redirect('/') } // auth success
);

app.get('/logout', checkAuth, function (req, res) {
    req.logout();
    res.redirect('/');
});

function checkOwner(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.id == config.oid) return next()
    }
    res.send("You're not owner.")
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

function checkAuthNeg(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.send('you\'re logged in already:)');
}


app.get("/", (req, res) => {
    res.render("landing", {
        user: req.isAuthenticated() ? {
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
            id: req.user.id
        } : null,
        guilds: bot.guilds.filter(fn => true)
    })
})
app.use("/guilds", require("./routes/guild"));
app.use((req,res) => {
    res.status(404).render("404", {
                user: req.isAuthenticated() ? {
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`,
            id: req.user.id
        } : null
    })
})

app.listen(8090, config.webserverip, () => {
    console.log("Webserver is running.")
})