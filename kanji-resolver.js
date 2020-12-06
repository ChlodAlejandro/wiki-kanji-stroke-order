"use strict";

const path = require("path");
const fs = require("fs-jetpack");
const axios = require("axios");

const {Module} = require("../../src/ModularExpressServer.js");

const placeholderImagesPath = path.resolve(__dirname, "../static/images/kanji");
const pathRegex = "^/kanji/";

module.exports = new Module(
    {
        name: "Kanji Resolver",
        sector: "Image Resolvers",
        description:
            "Parses a Kanji character from the path or the parameters, and returns "
            + "the stroke order for that kanji character."
    },
    pathRegex,
    {
        processWebRequest: async ({req, res, log}) => {
            let requestedCharacter = null;

            if ((requestedCharacter = req.path.replace(/^\/kanji\//g, "")).length == 0) {
                if ((requestedCharacter = req.query.character) == undefined) {
                    res.status(400);
                    res.sendFile(path.join(placeholderImagesPath, "no_char.png"));
                    return;
                }
            }

            requestedCharacter = decodeURIComponent(requestedCharacter);

            log.write("Requesting character: " + JSON.stringify(requestedCharacter));

            if (/[^\p{Script=Hani}\p{Script=Hira}\p{Script=Kana}]/gu.test(requestedCharacter)) {
                res.status(400);
                res.sendFile(path.join(placeholderImagesPath, "invalid_char.png"));
                return;
            }

            const animated = req.query.animated === "1";

            // /w/api.php?action=query&format=json&prop=imageinfo&titles=File%3A%E4%B8%80-bw.png&iiprop=url
            if (animated) {
                try {
                    const request = await axios.get("https://commons.wikimedia.org/w/api.php", {
                        params: {
                            action: "query",
                            format: "json",
                            prop: "imageinfo",
                            titles: `File:${requestedCharacter}-order.gif|File:${requestedCharacter}-jorder.gif`,
                            iiprop: "url"
                        },
                        responseType: "json"
                    });


                    let ii;
                    const url = (ii = Object.values(request.data.query.pages).find(
                        v => v.title === `File:${requestedCharacter}-jorder.gif`
                    )).missing === undefined ? 
                        ii.imageinfo[0].url : 
                        ((ii = Object.values(request.data.query.pages).find(
                            v => v.title === `File:${requestedCharacter}-order.gif`
                        )).missing === undefined ? ii.imageinfo[0].url : undefined);

                    if (url === undefined) {
                        res.status(404);
                        res.sendFile(path.join(placeholderImagesPath, "not_found.png"));
                        return;
                    }

                    let image = (await axios.get(url, {
                        responseType: "arraybuffer"
                    })).data;

                    res.status(200);
                    res.type("gif");
                    res.send(image);
                    return;
                } catch (error) {
                    console.error(error);
                    res.status(500);
                    res.sendFile(path.join(placeholderImagesPath, "error.png"));
                    return;
                }
            } else {
                try {
                    const request = await axios.get("https://commons.wikimedia.org/w/api.php", {
                        params: {
                            action: "query",
                            format: "json",
                            prop: "imageinfo",
                            titles: `File:${requestedCharacter}-bw.png|File:${requestedCharacter}-jbw.png`,
                            iiprop: "url"
                        },
                        responseType: "json"
                    });
                    
                    console.dir(request.data.query.pages);

                    let ii;
                    const url = (ii = Object.values(request.data.query.pages).find(
                        v => v.title === `File:${requestedCharacter}-jbw.png`
                    )).missing === undefined ? 
                        ii.imageinfo[0].url : 
                        ((ii = Object.values(request.data.query.pages).find(
                            v => v.title === `File:${requestedCharacter}-bw.png`
                        )).missing === undefined ? ii.imageinfo[0].url : undefined);

                    if (url === undefined) {
                        res.status(404);
                        res.sendFile(path.join(placeholderImagesPath, "not_found.png"));
                        return;
                    }

                    let image = (await axios.get(url, {
                        responseType: "arraybuffer"
                    })).data;

                    res.status(200);
                    res.type("png");
                    res.send(image);
                    return;
                } catch (error) {
                    console.error(error);
                    res.status(500);
                    res.sendFile(path.join(placeholderImagesPath, "error.png"));
                    return;
                }
            }
        }
    }
);
