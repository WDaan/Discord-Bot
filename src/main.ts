const schedule = require('node-schedule')
const Discord = require('discord.js')

const config = require('./config.json')

import { FUN } from './functions'
import { MSG } from './messages'

// logging in to discord
const discord = new Discord.Client()
discord.login(config.token)
discord.once('ready', () => {
    console.log('Ready!')
})

discord.on('message', async message => {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        if (message.content.startsWith(`${config.prefix}`)) {
            const words = message.content.split(' ')
            const fword = words[0].substring(1)
            switch (fword) {
                case 'wake':
                    message.channel.send(MSG.wake())
                    try {
                        FUN.wake()
                    } catch (err) {
                        message.channel.send(MSG.command_failed())
                    }
                    break
                case 'forcesleep':
                    message.channel.send(MSG.force_shutdown())
                    try {
                        FUN.shutdown()
                    } catch (err) {
                        message.channel.send(MSG.command_failed())
                    }
                    break
                case 'sleep':
                    message.channel.send(MSG.wait())
                    message.channel.send(await FUN.sleep())
                    break
                case 'info':
                    message.channel.send(MSG.info_header())
                    message.channel.send(MSG.info_music())
                    message.channel.send(MSG.info_Floki())
                    message.channel.send(MSG.info_meme())
                    message.channel.send(MSG.info_music_247())
                    break
                case 'status':
                    message.channel.send(MSG.wait())
                    message.channel.send(await FUN.status())
                    break
                default:
                    message.channel.send(MSG.no_command())
                    break
            }
        }
    } else {
        if (message.content.startsWith(`${config.prefix}`)) {
            message.channel.send(MSG.supreme)
        }
    }
})

// auto_shutdown server between 22h30 & 02h00
schedule.scheduleJob(
    {
        hour: 21,
        minute: 30
    },
    () => {
        FUN.autosleep(discord) // first check
        const startTime = new Date(Date.now())
        const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000)
        schedule.scheduleJob(
            {
                start: startTime,
                end: endTime,
                rule: '*/10 * * * *'
            },
            () => {
                FUN.autosleep(discord) // recheck every 10 min
            }
        )
    }
)
