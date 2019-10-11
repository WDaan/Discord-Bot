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
const schedule = require('node-schedule');
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');
const util_1 = require("util");
const functions_1 = require("./functions");
const messages_1 = require("./messages");
// logging in to discord
const discord = new Discord.Client();
discord.login(token);
discord.once('ready', () => {
    console.log('Ready!');
});
discord.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        if (message.content.startsWith(`${prefix}`)) {
            const words = message.content.split(' ');
            const fword = words[0].substring(1);
            switch (fword) {
                case 'wake':
                    message.channel.send(messages_1.MSG.wake());
                    try {
                        functions_1.FUN.wake();
                    }
                    catch (err) {
                        message.channel.send(messages_1.MSG.command_failed());
                    }
                    break;
                case 'forcesleep':
                    message.channel.send(messages_1.MSG.force_shutdown());
                    try {
                        functions_1.FUN.shutdown();
                    }
                    catch (err) {
                        message.channel.send(messages_1.MSG.command_failed());
                    }
                    break;
                case 'sleep':
                    message.channel.send(messages_1.MSG.wait());
                    message.channel.send(yield functions_1.FUN.sleep());
                    break;
                case 'storage':
                    message.channel.send(messages_1.MSG.wait());
                    let storage = yield functions_1.FUN.storage();
                    if (!util_1.isNull(storage) || !util_1.isUndefined(storage)) {
                        message.channel.send(messages_1.MSG.storage(storage));
                    }
                    else {
                        message.channel.send(messages_1.MSG.dead());
                    }
                    break;
                case 'info':
                    message.channel.send(messages_1.MSG.info_header());
                    message.channel.send(messages_1.MSG.info_music());
                    message.channel.send(messages_1.MSG.info_Floki());
                    message.channel.send(messages_1.MSG.info_meme());
                    message.channel.send(messages_1.MSG.info_music_247());
                    break;
                case 'status':
                    message.channel.send(messages_1.MSG.wait());
                    message.channel.send(yield functions_1.FUN.status());
                    break;
                default:
                    message.channel.send(messages_1.MSG.no_command());
                    break;
            }
        }
    }
    else {
        if (message.content.startsWith(`${prefix}`)) {
            message.channel.send(messages_1.MSG.supreme);
        }
    }
}));
// auto_shutdown server between 22h30 & 02h00
schedule.scheduleJob({
    hour: 21,
    minute: 30,
}, () => {
    functions_1.FUN.autosleep(discord); // first check
    const startTime = new Date(Date.now());
    const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000);
    schedule.scheduleJob({
        start: startTime,
        end: endTime,
        rule: '*/10 * * * *',
    }, () => {
        functions_1.FUN.autosleep(discord); // recheck every 10 min
    });
});
