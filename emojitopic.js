const Jimp = require("jimp");
const { read, MIME_PNG } = Jimp;
const GifWrap = require("gifwrap");
const prepareFrames = require("./util/prepFrames");
const endFrame = require("./util/prepTotalFrame");
const httpGet = (url) =>
    new Promise((rs, rj) => {
        const { get } = require("https");
        const { get: httpGet } = require("http");
        const getHandler = url.startsWith("http://") ? httpGet : get;
        getHandler(url, r => {
            let buffers = [];
            r.on("data", c => buffers.push(c));
            r.once("end", () => {
                let b = Buffer.concat(buffers);
                rs(b);
            });
            r.on("error", rj);
        });
    });
const doit = async (arg = "", pp) => {
    let spl = arg.split(" ").map(s => s.trim()).filter(i => i !== "");
    if (spl.length > 5) spl = spl.slice(0, 5);
    let getemot = (arg) => new Promise(rs => {
        const EmojiRegex = /<(a)?:.*?:(.*?)>/;
        const EmojiText = /:.*?:/;
        const EmojiSkinToneText = /:(.*?)::skin-tone-([1-5]):/;
        const EmojiTextSkinTone = /:(.*?):(🏻|🏼|🏽|🏾|🏿)/;
        const EmojiSkinToneMobile = new RegExp("(\u{261D}|\u{26F9}|\u{270A}|\u{270B}|\u{270C}|\u{270D}|\u{1F385}|\u{1F3C3}|\u{1F3C4}|\u{1F3CA}|\u{1F3CB}|\u{1F442}|\u{1F443}|\u{1F446}|\u{1F447}|\u{1F448}|\u{1F449}|\u{1F44A}|\u{1F44B}|\u{1F44C}|\u{1F44D}|\u{1F44E}|\u{1F44F}|\u{1F450}|\u{1F466}|\u{1F467}|\u{1F468}|\u{1F469}|\u{1F46E}|\u{1F470}|\u{1F471}|\u{1F472}|\u{1F473}|\u{1F474}|\u{1F475}|\u{1F476}|\u{1F477}|\u{1F478}|\u{1F47C}|\u{1F481}|\u{1F482}|\u{1F483}|\u{1F485}|\u{1F486}|\u{1F487}|\u{1F4AA}|\u{1F575}|\u{1F57A}|\u{1F590}|\u{1F595}|\u{1F596}|\u{1F645}|\u{1F646}|\u{1F647}|\u{1F64B}|\u{1F64C}|\u{1F64D}|\u{1F64E}|\u{1F64F}|\u{1F6A3}|\u{1F6B4}|\u{1F6B5}|\u{1F6B6}|\u{1F6C0}|\u{1F918}|\u{1F919}|\u{1F91A}|\u{1F91B}|\u{1F91C}|\u{1F91D}|\u{1F91E}|\u{1F926}|\u{1F930}|\u{1F933}|\u{1F934}|\u{1F935}|\u{1F936}|\u{1F937}|\u{1F938}|\u{1F939}|\u{1F93C}|\u{1F93D}|\u{1F93E}):skin-tone-([1-5]):");
        if (arg) {
            let m = arg.match(EmojiRegex);
            if (m && m.length > 0) {
                let animated = !!m[1];
                rs({ type: "discordCustomEmoji", url: `https://cdn.discordapp.com/emojis/${m[2]}${animated ? ".gif" : ".png"}`, animated });
            } else {
                let e = function (uS, sep) {
                    if (!uS) return "";
                    var r = [], c = 0, p = 0, i = 0;
                    while (i < uS.length) {
                        c = uS.charCodeAt(i++);
                        if (p) {
                            r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
                            p = 0;
                        } else if (0xD800 <= c && c <= 0xDBFF) {
                            p = c;
                        } else {
                            r.push(c.toString(16));
                        }
                    }
                    return r.join(sep || "-");
                };
                let m = arg.match(EmojiText);
                if (m && m.length > 0) {
                    httpGet("https://cdn.rawgit.com/omnidan/node-emoji/master/lib/emoji.json").then(b => {
                        let st = arg.match(EmojiSkinToneText);
                        let esk = arg.match(EmojiTextSkinTone);
                        let emk = arg.match(EmojiSkinToneMobile);
                        let parse;
                        try {
                            parse = JSON.parse(b.toString());
                        } catch (err) {
                            return;
                        }
                        function stripOut() {
                            if (st && st.length > 0) {
                                let e = st[1];
                                let skt = (parseInt(st[2]) + 1);
                                if (!parse[e] || parse[`skin-tone-${skt}`]) return "";
                                return `${parse[e]}${parse[`skin-tone-${skt}`]}`;
                            } else if (emk && emk.length > 0) {
                                let skt = (parseInt(emk[2]) + 1);
                                return `${emk[1]}${parse[`skin-tone-${skt}`]}`;
                            } else if (esk && esk.length > 0) {
                                if (!parse[esk[1]]) return "";
                                else return `${parse[esk[1]][esk[2]]}`;
                            } else { if (!parse[arg.replace(/:/g, "")]) return ""; return parse[arg.replace(/:/g, "")]; }
                        }
                        let exec = stripOut();
                        rs({ type: "unicodeEmote", url: `https://twitter.github.io/twemoji/2/72x72/${e(exec)}.png` });
                    });
                } else rs({ type: "unicodeEmote", url: `https://twitter.github.io/twemoji/2/72x72/${e(arg)}.png` });
            }
        }
    });
    let result = await Promise.all(spl.map(getemot));
    if (result.length === 1) return {
        image: await httpGet(result[0].url),
        animated: result[0].animated
    };
    let data = await Promise.all(result.map(r => {
        if (r.animated) return httpGet(r.url).then(e => {
            return prepareFrames(r, e);
        });
        return read(r.url).then(i => prepareFrames(r, new GifWrap.GifFrame(new GifWrap.BitmapImage(i.bitmap))));
    }));
    let imgs = data.map(d => d.frames);
    let total = 0;
    // How to create a gif with frames of different size :thinking:
    let height = imgs.slice().sort((a, b) => b[0].bitmap.height - a[0].bitmap.height)[0][0].bitmap.height;
    let frames = imgs.slice().sort((a, b) => b.length - a.length)[0].length;

    imgs.forEach(f => f.forEach(f => f.interlaced = false));
    for (let i = 0; i < imgs.length; i++) {
        if (i == 0) total += imgs[i][0].bitmap.width;
        else total += (imgs[i][0].bitmap.width + 8);
    }

    let qFrames = imgs.slice();
    let totalFrames = await endFrame(total, height, /*imgs*/ qFrames, frames);
    const gifCodec = new GifWrap.GifCodec();
    async function quantizeImages() {
        const resultImages = [];
        for (let i = 0; i < totalFrames.length; i++) {
            let frame = totalFrames[i];
            const r = await pp.send("e2pquantize", {
                frames: [{
                    width: frame.bitmap.width,
                    height: frame.bitmap.height,
                    data: frame.bitmap.data.toString("base64")
                }]
            });
            r.forEach(i => {resultImages.push(new GifWrap.GifFrame({
                width: i.width,
                height: i.height,
                data: Buffer.from(i.data, "base64")
            }, {
                delayCentisecs: 2
            }));});
        }
        return resultImages;
    }
    const f = await quantizeImages();
    const gif = await gifCodec.encodeGif(f, {
        colorScope: 2
    });
    let image = gif.buffer;
    if (gif.frames.length === 1) {
        let frame = gif.frames[0];
        const img = new Jimp(0, 0, 1);
        img.bitmap = new GifWrap.BitmapImage(frame).bitmap;
        image = (await new Promise((rs, rj) => img.getBuffer(MIME_PNG, (e, b) => e ? rj(e) : rs(b))));
    }
    return {
        image,
        animated: gif.frames.length !== 1,
        generated: gif.frames.length > 1
    };
};
module.exports = doit;
