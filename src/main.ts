import schedule from 'node-schedule'
import Discord from 'discord.js'

require('dotenv').config()

import { FUN } from './functions'
import { MSG } from './messages'

// logging in to discord
const discord = new Discord.Client()
discord.login(process.env.DISCORD_TOKEN)
discord.once('ready', () => {
    console.log('Ready!')
})

discord.on('message', async message => {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        if (message.content.startsWith(`${process.env.PREFIX}`)) {
            const fword = message.content.split(' ')[0].substring(1)
            let channel = message.channel
            switch (fword) {
                case 'wake':
                    channel.send(MSG.wake())
                    FUN.wake()
                        ? channel.send(MSG.wakeSuccesfull())
                        : MSG.command_failed()
                    break
                case 'forcesleep':
                    channel.send(MSG.force_shutdown())
                    FUN.shutdown()
                        ? channel.send(MSG.shutdownSuccesfull())
                        : channel.send(MSG.command_failed())

                    break
                case 'sleep':
                    channel.send(MSG.wait())
                    channel.send(await FUN.sleep())
                    break
                case 'info':
                    channel.send(MSG.info_header())
                    channel.send(MSG.info_music())
                    channel.send(MSG.info_Floki())
                    channel.send(MSG.info_meme())
                    channel.send(MSG.info_music_247())
                    break
                case 'status':
                    channel.send(MSG.wait())
                    channel.send(await FUN.status())
                    break
                default:
                    channel.send(MSG.no_command())
                    break
            }
        }
    } else {
        if (message.content.startsWith(`${process.env.PREFIX}`)) {
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
