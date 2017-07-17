global.fs = require("fs");
global.speakerPhoneBinds = require("./speakerphonemodule");
global.queries = require("./queries/index");
global.userQuery = queries.user;
require("./checkConfig")();
require("./discord")();
require("./webserver/index");
global.db = require("rethinkdbdash")({
    db: "ttalpha"
});
global.keymetrics = require("./keymetrics/index.js");
global.moment = require("moment");
global.decimalToHex = function (d) {
    var hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex;
};
global.translations = new (require("./translations/index"))();
global.format = require("util").format;
global.getUptime = function getUptime(moment1, moment2) {
    var diff = moment.duration(moment1.diff(moment2));
    var diffString = `${diff.days() > 0 ? diff.days() + " days, " : ""}${diff.hours() > 0 ? diff.hours() + " hours, " : ""}${diff.minutes()} minutes, and ${diff.seconds()} seconds`;
    return diffString;
};