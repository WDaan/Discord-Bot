import { isNull, isUndefined } from 'util'
import { Media, User, Viewers } from './models'

export namespace MSG {
    export function wait(): string {
        return 'One moment pls...'
    }

    export function no_command(): string {
        return 'Das geen command! Kunde gij nie typen ofzo eh?!'
    }

    export function supreme(): string {
        return 'Das enkel voor Supreme Leaders, wa hoopt gij zelf??'
    }

    export function wake(): object {
        return {
            embed: {
                color: 3447003,
                title: `Waking up ${process.env.SERVER_NAME}...`
            }
        }
    }

    export function wakeSuccesfull(): object {
        return {
            embed: { color: 0x00ff22, title: 'Wakeup sucessful ^_^' }
        }
    }

    export function shutdownSuccesfull(): object {
        return {
            embed: { color: 0x00ff22, title: 'Shutdown sucessful ^_^' }
        }
    }

    export function command_failed(): object {
        return {
            embed: { color: 0xe31b1b, title: 'Command failed :cry:' }
        }
    }

    export function force_shutdown(): object {
        return {
            embed: {
                color: 3447003,
                title: `Turning off ${process.env.SERVER_NAME}...`
            }
        }
    }

    export function info_header(): object {
        return {
            embed: { color: 3447003, title: '-----Server Info-----' }
        }
    }

    export function info_music(): object {
        return {
            embed: {
                color: 0xe31b1b,
                title: 'Music Player',
                fields: [
                    { name: 'Prefix : ', value: '$', inline: true },
                    {
                        name: 'Popular commands',
                        value:
                            '$play (link or songname)\n$pause\n$stop\n$skip\n$unpause\n$forward (getal)'
                    }
                ]
            }
        }
    }

    export function info_Floki(): object {
        return {
            embed: {
                color: 0x14d928,
                title: `${process.env.SERVER_NAME}`,
                fields: [
                    { name: 'Prefix : ', value: '!', inline: true },
                    {
                        name: 'Popular commands',
                        value: '!meme\n!wake\n!sleep\n!storage\n!info\n!status'
                    }
                ]
            }
        }
    }

    export function info_meme(): object {
        return {
            embed: {
                color: 0x01f5fa,
                title: 'Dank Memers',
                fields: [
                    { name: 'Prefix: ', value: 'pls', inline: true },
                    {
                        name: 'Popular commands',
                        value:
                            'pls meme\npls memeeconomy\npls mock (name)\npls emojify (text)\npls help image\npls help memey\npls help fun'
                    }
                ]
            }
        }
    }

    export function info_music_247(): object {
        return {
            embed: {
                color: 0x0017ff,
                title: '24/7 music',
                fields: [
                    { name: 'Prefix: ', value: 'mb', inline: true },
                    {
                        name: 'Popular commands',
                        value:
                            'mb play <radiostreamlink/mp3stream/youtubelink/search>\nmb np //shows now playing\nmb streamlinks //shows available stations\nmb leave //stops music'
                    }
                ]
            }
        }
    }

    export function no_one_watching(): object {
        return {
            embed: { color: 0x00ff22, title: 'No one is watching' }
        }
    }

    export function alive(): object {
        return {
            embed: { color: 0x00ff22, title: 'Server is online ^__^' }
        }
    }

    export function dead(): object {
        return {
            embed: { color: 0xff0000, title: 'Server is offline :/' }
        }
    }

    export function user_shutdown(): object {
        const hours = new Date().getHours()
        const min = new Date().getMinutes()
        return {
            embed: {
                color: 3447003,
                title: 'Server was shutdown at ' + hours + ':' + min
            }
        }
    }

    export function auto_shutdown(discord): void {
        const channel = discord.channels.find(x => x.name === 'bot-commands')
        const hours = new Date().getHours()
        const min = new Date().getMinutes()
        channel.send({
            embed: {
                color: 3447003,
                title: 'Server was auto shutdown at ' + hours + ':' + min
            }
        })
    }

    export function watching_users(viewers: Viewers): object {
        let watching_users_string = ''
        if (!isUndefined(viewers) && !isNull(viewers)) {
            for (let i = 0; i < viewers.num; i++) {
                watching_users_string +=
                    viewers.users[i].name +
                    ': ' +
                    viewers.users[i].media.type +
                    '  ----  ' +
                    viewers.users[i].media.maker +
                    '  -  ' +
                    viewers.users[i].media.title +
                    '\n'
            }
        }
        return {
            embed: { color: 3447003, title: watching_users_string }
        }
    }

    export function shutdown_error(num: number): object {
        return {
            embed: {
                color: 0xff0000,
                title: "I can't do that, " + num + ' still watching.'
            }
        }
    }
}
