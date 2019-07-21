"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
var MSG;
(function (MSG) {
    function wait() {
        return 'One moment pls...';
    }
    MSG.wait = wait;
    function no_command() {
        return 'Das geen command! Kunde gij nie typen ofzo eh?!';
    }
    MSG.no_command = no_command;
    function supreme() {
        return 'Das enkel voor Supreme Leaders, wa hoopt gij zelf??';
    }
    MSG.supreme = supreme;
    function wake() {
        return {
            embed: { color: 3447003, title: 'Waking up Floki...' }
        };
    }
    MSG.wake = wake;
    function force_shutdown() {
        return {
            embed: { color: 3447003, title: 'Turning off Floki...' }
        };
    }
    MSG.force_shutdown = force_shutdown;
    function info_header() {
        return {
            embed: { color: 3447003, title: '-----Server Info-----' }
        };
    }
    MSG.info_header = info_header;
    function info_music() {
        return {
            embed: {
                color: 0xe31b1b, title: 'Music Player',
                fields: [
                    { name: 'Prefix : ', value: '$', inline: true },
                    { name: 'Popular commands', value: '$play (link or songname)\n$pause\n$stop\n$skip\n$unpause\n$forward (getal)' }
                ]
            }
        };
    }
    MSG.info_music = info_music;
    function info_Floki() {
        return {
            embed: {
                color: 0x14d928,
                title: 'Floki',
                fields: [
                    { name: 'Prefix : ', value: '!', inline: true },
                    { name: 'Popular commands', value: '!meme\n!wake\n!sleep\n!storage\n!info\n!status' }
                ]
            }
        };
    }
    MSG.info_Floki = info_Floki;
    function info_meme() {
        return {
            embed: {
                color: 0x01f5fa,
                title: 'Dank Memers',
                fields: [
                    { name: 'Prefix: ', value: 'pls', inline: true },
                    {
                        name: 'Popular commands',
                        value: 'pls meme\npls memeeconomy\npls mock (name)\npls emojify (text)\npls help image\npls help memey\npls help fun'
                    }
                ]
            }
        };
    }
    MSG.info_meme = info_meme;
    function info_music_247() {
        return {
            embed: {
                color: 0x0017ff,
                title: '24/7 music',
                fields: [
                    { name: 'Prefix: ', value: 'mb', inline: true },
                    {
                        name: 'Popular commands',
                        value: 'mb play <radiostreamlink/mp3stream/youtubelink/search>\nmb np //shows now playing\nmb streamlinks //shows available stations\nmb leave //stops music'
                    }
                ]
            }
        };
    }
    MSG.info_music_247 = info_music_247;
    function no_one_watching() {
        return {
            embed: { color: 0x00ff22, title: 'No one is watching' }
        };
    }
    MSG.no_one_watching = no_one_watching;
    function alive() {
        return {
            embed: { color: 0x00ff22, title: 'Server is online ^__^' }
        };
    }
    MSG.alive = alive;
    function dead() {
        return {
            embed: { color: 0xff0000, title: 'Server is offline :/' }
        };
    }
    MSG.dead = dead;
    function user_shutdown() {
        const hours = new Date().getHours();
        const min = new Date().getMinutes();
        return {
            embed: {
                color: 3447003,
                title: 'Server was shutdown at ' + hours + ':' + min
            }
        };
    }
    MSG.user_shutdown = user_shutdown;
    function auto_shutdown(discord) {
        const channel = discord.channels.find(x => x.name === 'bot-commands');
        const hours = new Date().getHours();
        const min = new Date().getMinutes();
        channel.send({ embed: {
                color: 3447003,
                title: 'Server was auto shutdown at ' + hours + ':' + min
            } });
    }
    MSG.auto_shutdown = auto_shutdown;
    function storage(storage) {
        return {
            embed: {
                color: 3447003,
                title: 'Storage Info:',
                fields: [
                    {
                        name: 'Free:',
                        value: storage.free + ' Gb',
                        inline: true
                    },
                    {
                        name: 'Daan:',
                        value: storage.daan + ' Gb',
                        inline: true
                    },
                    {
                        name: 'Media:',
                        value: storage.media + ' Gb',
                        inline: true
                    }
                ]
            }
        };
    }
    MSG.storage = storage;
    function watching_users(viewers) {
        let watching_users_string = '';
        if (!util_1.isUndefined(viewers) && !util_1.isNull(viewers)) {
            for (let i = 0; i < viewers.num; i++) {
                watching_users_string +=
                    viewers.users[i].name +
                        ': ' +
                        viewers.users[i].media.type +
                        '  ----  ' +
                        viewers.users[i].media.maker +
                        '  -  ' +
                        viewers.users[i].media.title +
                        '\n';
            }
        }
        return {
            embed: { color: 3447003, title: watching_users_string }
        };
    }
    MSG.watching_users = watching_users;
    function shutdown_error(num) {
        return {
            embed: {
                color: 0xff0000,
                title: 'I can\'t do that, ' + num + ' still watching.'
            }
        };
    }
    MSG.shutdown_error = shutdown_error;
})(MSG = exports.MSG || (exports.MSG = {}));
