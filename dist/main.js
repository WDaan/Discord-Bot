"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require('node-schedule');
const Discord = require('discord.js');
const SSH = require('simple-ssh');
const { token, prefix, pi_host, pi_pass, pi_user } = require('./config.json');
const util_1 = require("util");
const functions_1 = require("./functions");
const messages_1 = require("./messages");
// logging in to discord
const discord = new Discord.Client();
discord.login(token);
discord.once('ready', () => {
    console.log('Ready!');
});
// ssh'in into pi
const ssh = new SSH({
    host: pi_host,
    user: pi_user,
    pass: pi_pass
});
ssh.on('error', err => {
    const channel = discord.channels.find(x => x.name === 'bot-commands');
    channel.send('Couldn\'t ssh into pi');
    console.log(err);
    ssh.end();
});
discord.on('message', async (message) => {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        if (message.content.startsWith(`${prefix}`)) {
            const words = message.content.split(' ');
            const fword = words[0].substring(1);
            switch (fword) {
                case 'wake':
                    const msg = messages_1.MSG.wake();
                    message.channel.send(msg);
                    functions_1.FUN.wake(ssh);
                    break;
                case 'forcesleep':
                    message.channel.send(messages_1.MSG.force_shutdown());
                    functions_1.FUN.shutdown(ssh);
                    break;
                case 'sleep':
                    message.channel.send(messages_1.MSG.wait());
                    message.channel.send(await functions_1.FUN.sleep(ssh));
                    break;
                case 'storage':
                    message.channel.send(messages_1.MSG.wait());
                    const storage = await functions_1.FUN.storage();
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
                    message.channel.send(await functions_1.FUN.status());
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
});
// auto_shutdown server between 22h30 & 02h00
const Shutdown_Handler = schedule.scheduleJob({
    hour: 9,
    minute: 24
}, () => {
    functions_1.FUN.autosleep(discord, ssh); // first check
    const startTime = new Date(Date.now());
    const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000);
    const j = schedule.scheduleJob({
        start: startTime,
        end: endTime,
        rule: '*/10 * * * *'
    }, () => {
        functions_1.FUN.autosleep(discord, ssh); // recheck every 10 min
    });
});
