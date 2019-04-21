"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require('cheerio');
const ping = require('ping');
const request = require('request-promise');
const SSH = require('simple-ssh');
const media_class_1 = require("./media.class");
const user_class_1 = require("./user.class");
const viewers_class_1 = require("./viewers.class");
const convert_xml = require('xml-js');
const util_1 = require("util");
const discord_client_class_1 = require("./discord_client.class");
const { pi_user, pi_pass, pi_host, server_ip, plex_token } = require('./config.json');
// ssh (for shutdown and wake) && other server functions
class Server {
    constructor() {
        this.ssh = new SSH({
            host: pi_host,
            user: pi_user,
            pass: pi_pass
        });
        this.ssh.on('error', function (err) {
            const channel = discord_client_class_1.discord_client.discord.channels.find(x => x.name === 'bot-commands');
            channel.send('Couldn\'t ssh into pi');
            console.log(err);
            this.ssh.end();
        });
    }
    wake() {
        this.ssh.exec('/home/wake.sh', {}).start();
    }
    shutdown() {
        this.ssh.exec('/home/sleep.sh', {}).start();
    }
    async is_alive() {
        const _alive = await ping.promise.probe(server_ip);
        const { alive } = _alive;
        return alive;
    }
    // everything to do with storage
    async storage() {
        if (await this.is_alive() === true) {
            const storage_data = await this.request_storage_html();
            return new Promise((resolve, reject) => {
                if (!util_1.isUndefined(storage_data) && !util_1.isNull(storage_data)) {
                    this.map_storage_data(storage_data);
                    resolve('storage done');
                }
                else {
                    reject('storage failed');
                }
            });
        }
        else {
            discord_client_class_1.discord_client.update_msg();
            return false;
        }
    }
    map_storage_data(data) {
        discord_client_class_1.discord_client.storage_data.free = data[1];
        discord_client_class_1.discord_client.storage_data.daan = data[2];
        discord_client_class_1.discord_client.storage_data.media = data[3];
        discord_client_class_1.discord_client.update_msg();
    }
    async request_storage_html() {
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
        return this.parse_storage_html(html_body);
    }
    async parse_storage_html(body) {
        const $ = cheerio.load(body);
        const data = $('#array');
        return JSON.parse(data.text().substring(7));
    }
    // everything todo with plex & sleep
    async sleep() {
        if (this.is_alive()) {
            return new Promise(async (resolve, reject) => {
                const viewers = await this.check_plex();
                // if number of viewers is 0, server can shutdown
                // tslint:disable-next-line: triple-equals
                if (viewers.num == 0) {
                    this.shutdown();
                    resolve(discord_client_class_1.discord_client.msg.user_shutdown);
                }
                else {
                    discord_client_class_1.discord_client.viewers = viewers;
                    discord_client_class_1.discord_client.update_msg();
                    resolve(discord_client_class_1.discord_client.msg.shutdown_error);
                }
            });
        }
    }
    async status() {
        if (await this.is_alive() === true) {
            return new Promise(async (resolve, reject) => {
                const viewers = await this.check_plex();
                // tslint:disable-next-line: triple-equals
                if (viewers.num == 0) {
                    discord_client_class_1.discord_client.update_msg();
                    resolve(discord_client_class_1.discord_client.msg.no_one_watching);
                }
                else {
                    discord_client_class_1.discord_client.viewers = viewers;
                    discord_client_class_1.discord_client.set_user_string();
                    discord_client_class_1.discord_client.update_msg();
                    resolve(discord_client_class_1.discord_client.msg.watching_users);
                }
            });
        }
        else {
            return new Promise(async (resolve, reject) => {
                discord_client_class_1.discord_client.update_msg();
                resolve(discord_client_class_1.discord_client.msg.dead);
            });
        }
    }
    async check_plex() {
        //
        return new Promise(async (resolve, reject) => {
            const viewers = await this.request_plex_xml();
            resolve(viewers);
            reject('something went wrong');
        });
    }
    // request the whole xml from plex
    async request_plex_xml() {
        let json;
        await request(
        // request the data
        {
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
        return this.parse_plex_json(json);
    }
    // get the number of users, en userdata if necessary
    parse_plex_json(json) {
        let viewers = new viewers_class_1.Viewers();
        const num_active_users = json.MediaContainer._attributes.size;
        viewers.num = num_active_users;
        if (num_active_users > 0) {
            viewers = this.parse_user_info(json, viewers);
        }
        return viewers;
    }
    // get the name of the active plex users
    parse_user_info(json, viewers) {
        // parse songs
        try {
            const Tracks = json.MediaContainer.Track;
            let nTrack = Tracks.length;
            if (nTrack === undefined) {
                nTrack = 1;
            }
            if (nTrack === 1) {
                const m = this.get_maker(Tracks);
                const usr = new user_class_1.User(Tracks.User._attributes.title, m);
                viewers.add_user(usr);
            }
            else if (nTrack > 1) {
                for (let i = 0; i < nTrack; i++) {
                    const m = this.get_maker(Tracks[i]);
                    const usr = new user_class_1.User(Tracks[i].User._attributes.title, m);
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
                const m = this.get_maker(Videos);
                const usr = new user_class_1.User(Videos.User._attributes.title, m);
                viewers.add_user(usr);
            }
            else if (nVideo > 1) {
                for (let i = 0; i < nVideo; i++) {
                    const m = this.get_maker(Videos[i]);
                    const usr = new user_class_1.User(Videos[i].User._attributes.title, m);
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
    get_maker(info) {
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
        const m = new media_class_1.Media(type, maker, title);
        return m;
    }
    // automatic sleep
    async autosleep() {
        console.log('trying to auto shutdown');
        const viewers = await this.check_plex();
        // tslint:disable-next-line: triple-equals
        if (viewers.num == 0) {
            this.shutdown();
            discord_client_class_1.discord_client.update_msg();
            discord_client_class_1.discord_client.write_auto_shutdown();
        }
    }
}
exports.server = new Server();
