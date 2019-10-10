"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ping = require('ping');
const request = require('request-promise');
const convert_xml = require('xml-js');
const cheerio = require('cheerio');
const util_1 = require("util");
const shell = require('shelljs');
const { server_ip, plex_token, cmd_shutdown, cmd_wakeonlan } = require('./config.json');
const messages_1 = require("./messages");
const models_1 = require("./models");
var FUN;
(function (FUN) {
    function wake() {
        shell.exec(cmd_wakeonlan);
    }
    FUN.wake = wake;
    function shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            shell.exec(cmd_shutdown);
        });
    }
    FUN.shutdown = shutdown;
    // get storage
    function storage() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield is_alive()) === true) {
                const storage_data = yield request_storage_html();
                return new Promise((resolve, reject) => {
                    if (!util_1.isUndefined(storage_data) && !util_1.isNull(storage_data)) {
                        const storage = map_storage_data(storage_data);
                        resolve(storage);
                    }
                    else {
                        reject('storage failed');
                    }
                });
            }
        });
    }
    FUN.storage = storage;
    function status() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield is_alive()) === true) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const viewers = yield check_plex();
                    // tslint:disable-next-line: triple-equals
                    if (viewers.num == 0) {
                        resolve(messages_1.MSG.no_one_watching());
                    }
                    else {
                        resolve(messages_1.MSG.watching_users(viewers));
                    }
                }));
            }
            else {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    resolve(messages_1.MSG.dead());
                }));
            }
        });
    }
    FUN.status = status;
    function sleep() {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield is_alive()) === true) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    const viewers = yield check_plex();
                    // if number of viewers is 0, server can shutdown
                    if (viewers.num == 0) {
                        shutdown();
                        resolve(messages_1.MSG.user_shutdown());
                    }
                    else {
                        resolve(messages_1.MSG.shutdown_error(viewers.num));
                    }
                }));
            }
            else {
                // should fix the error i guess :p
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () { return resolve('Server was already offline...'); }));
            }
        });
    }
    FUN.sleep = sleep;
    // automatic sleep
    function autosleep(discord) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('trying to auto shutdown -- ' + new Date().toUTCString());
            const viewers = yield check_plex();
            if (viewers === 'offline') {
                console.log('server already offline');
            }
            else {
                if (viewers.num == 0) {
                    shutdown();
                    messages_1.MSG.auto_shutdown(discord);
                }
            }
        });
    }
    FUN.autosleep = autosleep;
})(FUN = exports.FUN || (exports.FUN = {}));
function is_alive() {
    return __awaiter(this, void 0, void 0, function* () {
        const _alive = yield ping.promise.probe(server_ip);
        const { alive } = _alive;
        return alive;
    });
}
// STORAGE RELATED FUNCTIONS
function map_storage_data(data) {
    return new models_1.StorageInfo(data[1], data[2], data[3]);
}
function request_storage_html() {
    return __awaiter(this, void 0, void 0, function* () {
        let html_body;
        yield request({
            url: 'https://yeet.wdaan.me/php/index.php',
            json: true,
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                // console.log(body); // Print the json response
                html_body = body;
            }
        });
        return parse_storage_html(html_body);
    });
}
function parse_storage_html(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const $ = cheerio.load(body);
        const data = $('#array');
        return JSON.parse(data.text().substring(7));
    });
}
// PLEX RELATED FUNCTIONS
function check_plex() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield is_alive()) === true) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const viewers = yield request_plex_xml();
                resolve(viewers);
                reject('something went wrong');
            }));
        }
        else {
            return 'offline';
        }
    });
}
// request the whole xml from plex
function request_plex_xml() {
    return __awaiter(this, void 0, void 0, function* () {
        let json;
        // request the data
        yield request({
            url: 'http://' + server_ip + ':32400/status/sessions?X-Plex-Token=' + plex_token,
            json: false,
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                // convert xml to json
                const result = convert_xml.xml2json(body, {
                    compact: true,
                    spaces: 4,
                });
                json = JSON.parse(result);
            }
        });
        return parse_plex_json(json);
    });
}
// get the number of users, en userdata if necessary
function parse_plex_json(json) {
    let viewers = new models_1.Viewers();
    const num_active_users = json.MediaContainer._attributes.size;
    viewers.num = num_active_users;
    if (num_active_users > 0) {
        viewers = parse_user_info(json, viewers);
    }
    return viewers;
}
// get the name of the active plex users
function parse_user_info(json, viewers) {
    // parse songs
    try {
        const Tracks = json.MediaContainer.Track;
        let nTrack = Tracks.length;
        if (nTrack === undefined) {
            nTrack = 1;
        }
        if (nTrack === 1) {
            const m = get_maker(Tracks);
            const usr = new models_1.User(Tracks.User._attributes.title, m);
            viewers.add_user(usr);
        }
        else if (nTrack > 1) {
            for (let i = 0; i < nTrack; i++) {
                const m = get_maker(Tracks[i]);
                const usr = new models_1.User(Tracks[i].User._attributes.title, m);
                viewers.add_user(usr);
            }
        }
    }
    catch (err) {
        // console.log('no songs');
    }
    // parse videos
    try {
        const Videos = json.MediaContainer.Video;
        let nVideo = Videos.length;
        if (nVideo === undefined) {
            nVideo = 1;
        }
        // console.log("Videos: " + nVideo);
        if (nVideo === 1) {
            const m = get_maker(Videos);
            const usr = new models_1.User(Videos.User._attributes.title, m);
            viewers.add_user(usr);
        }
        else if (nVideo > 1) {
            for (let i = 0; i < nVideo; i++) {
                const m = get_maker(Videos[i]);
                const usr = new models_1.User(Videos[i].User._attributes.title, m);
                viewers.add_user(usr);
            }
        }
    }
    catch (err) {
        // console.log('no vids');
    }
    return viewers;
}
// get info on the media that's playing
function get_maker(info) {
    let maker;
    let title;
    let type;
    switch (info._attributes.type) {
        case 'track':
            type = 'Music';
            maker = info._attributes.grandparentTitle;
            title = info._attributes.title;
            break;
        case 'episode':
            type = 'Serie';
            maker = info._attributes.grandparentTitle;
            maker +=
                ' (' +
                    info._attributes.parentTitle.substring(0, 1) +
                    info._attributes.parentTitle.substring(info._attributes.parentTitle.length - 2, info._attributes.parentTitle.length) +
                    'E' +
                    info._attributes.index +
                    ')';
            title = info._attributes.title;
            break;
        case 'movie':
            type = 'Movie';
            maker = info._attributes.title;
            title = '';
            break;
    }
    return new models_1.Media(type, maker, title);
}
function system_sleep(s) {
    let ms = s * 1000;
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
