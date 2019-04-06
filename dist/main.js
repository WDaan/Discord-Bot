"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require('node-schedule');
const discord_client_class_1 = require("./discord_client.class");
const server_class_1 = require("./server.class");
const { prefix } = require('./config.json');
// BOT command handling
discord_client_class_1.discord_client.discord.on('message', async (message) => {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        if (message.content.startsWith(`${prefix}`)) {
            const words = message.content.split(' ');
            const fword = words[0].substring(1);
            switch (fword) {
                case 'wake':
                    discord_client_class_1.discord_client.update_msg();
                    message.channel.send(discord_client_class_1.discord_client.msg.wake);
                    server_class_1.server.wake();
                    break;
                case 'forcesleep':
                    discord_client_class_1.discord_client.update_msg();
                    message.channel.send(discord_client_class_1.discord_client.msg.force_shutdown);
                    server_class_1.server.shutdown();
                    break;
                case 'sleep':
                    discord_client_class_1.discord_client.update_msg();
                    message.channel.send(discord_client_class_1.discord_client.msg.wait);
                    message.channel.send(await server_class_1.server.sleep());
                    break;
                case 'storage':
                    message.channel.send(discord_client_class_1.discord_client.msg.wait);
                    await server_class_1.server.storage();
                    message.channel.send(discord_client_class_1.discord_client.msg.storage);
                    break;
                case 'info':
                    message.channel.send(discord_client_class_1.discord_client.msg.info_header);
                    message.channel.send(discord_client_class_1.discord_client.msg.info_music);
                    message.channel.send(discord_client_class_1.discord_client.msg.info_Floki);
                    message.channel.send(discord_client_class_1.discord_client.msg.info_meme);
                    message.channel.send(discord_client_class_1.discord_client.msg.info_music_247);
                    break;
                case 'status':
                    message.channel.send(discord_client_class_1.discord_client.msg.wait);
                    message.channel.send(await server_class_1.server.status());
                    break;
                default:
                    message.channel.send(discord_client_class_1.discord_client.msg.no_command);
                    break;
            }
        }
    }
    else {
        if (message.content.startsWith(`${prefix}`)) {
            message.channel.send(discord_client_class_1.discord_client.msg.supreme);
        }
    }
});
// auto_shutdown server between 22h30 & 02h00
const Shutdown_Handler = schedule.scheduleJob({
    hour: 22,
    minute: 30
}, () => {
    server_class_1.server.autosleep(); // first check
    const startTime = new Date(Date.now());
    const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000);
    const j = schedule.scheduleJob({
        start: startTime,
        end: endTime,
        rule: '*/10 * * * *'
    }, () => {
        server_class_1.server.autosleep(); // recheck every 10 min
    });
});
