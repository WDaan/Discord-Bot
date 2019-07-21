"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ping = require('ping');
const request = require('request-promise');
const convert_xml = require('xml-js');
const cheerio = require('cheerio');
const util_1 = require("util");
const { server_ip, plex_token } = require('./config.json');
const messages_1 = require("./messages");
const models_1 = require("./models");
var FUN;
(function (FUN) {
    function wake(ssh) {
        ssh.exec('/home/wake.sh', {}).start();
    }
    FUN.wake = wake;
    function shutdown(ssh) {
        ssh.exec('/home/sleep.sh', {}).start();
    }
    FUN.shutdown = shutdown;
    // get storage
    async function storage() {
        if ((await is_alive()) === true) {
            const storage_data = await request_storage_html();
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
    }
    FUN.storage = storage;
    async function status() {
        if ((await is_alive()) === true) {
            return new Promise(async (resolve, reject) => {
                const viewers = await check_plex();
                // tslint:disable-next-line: triple-equals
                if (viewers.num == 0) {
                    resolve(messages_1.MSG.no_one_watching());
                }
                else {
                    resolve(messages_1.MSG.watching_users(viewers));
                }
            });
        }
        else {
            return new Promise(async (resolve, reject) => {
                resolve(messages_1.MSG.dead());
            });
        }
    }
    FUN.status = status;
    async function sleep(ssh) {
        if ((await is_alive()) === true) {
            return new Promise(async (resolve, reject) => {
                const viewers = await check_plex();
                // if number of viewers is 0, server can shutdown
                // tslint:disable-next-line: triple-equals
                if (viewers.num == 0) {
                    shutdown(ssh);
                    resolve(messages_1.MSG.user_shutdown());
                }
                else {
                    resolve(messages_1.MSG.shutdown_error(viewers.num));
                }
            });
        }
        else {
            // should fix the error i guess :p
            return new Promise(async (resolve, reject) => reject('Server was already offline...'));
        }
    }
    FUN.sleep = sleep;
    // automatic sleep
    async function autosleep(discord, ssh) {
        console.log('trying to auto shutdown -- ' + new Date().toUTCString());
        const viewers = await check_plex();
        if (viewers === 'offline') {
            console.log('server already offline');
        }
        else {
            // tslint:disable-next-line: triple-equals
            if (viewers.num == 0) {
                shutdown(ssh);
                messages_1.MSG.auto_shutdown(discord);
            }
        }
    }
    FUN.autosleep = autosleep;
})(FUN = exports.FUN || (exports.FUN = {}));
async function is_alive() {
    const _alive = await ping.promise.probe(server_ip);
    const { alive } = _alive;
    return alive;
}
// STORAGE RELATED FUNCTIONS
function map_storage_data(data) {
    return new models_1.StorageInfo(data[1], data[2], data[3]);
}
async function request_storage_html() {
    let html_body;
    await request({
        url: 'https://yeet.wdaan.me/php/index.php',
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            // console.log(body); // Print the json response
            html_body = body;
        }
    });
    return parse_storage_html(html_body);
}
async function parse_storage_html(body) {
    const $ = cheerio.load(body);
    const data = $('#array');
    return JSON.parse(data.text().substring(7));
}
// PLEX RELATED FUNCTIONS
async function check_plex() {
    if ((await is_alive()) === true) {
        return new Promise(async (resolve, reject) => {
            const viewers = await request_plex_xml();
            resolve(viewers);
            reject('something went wrong');
        });
    }
    else {
        return 'offline';
    }
}
// request the whole xml from plex
async function request_plex_xml() {
    let json;
    // request the data
    await request({
        url: 'http://' +
            server_ip +
            ':32400/status/sessions?X-Plex-Token=' +
            plex_token,
        json: false
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            // convert xml to json
            const result = convert_xml.xml2json(body, {
                compact: true,
                spaces: 4
            });
            json = JSON.parse(result);
        }
    });
    return parse_plex_json(json);
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
