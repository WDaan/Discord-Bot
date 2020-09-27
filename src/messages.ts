import { Media, User, Viewers } from './models'

export namespace MSG {
    export function wait(): string {
        return 'One moment pls...'
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
                        value: '!wake\n!sleep\n!info\n!status'
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
        if (viewers && viewers.num) {
            viewers.users.forEach(u => {
                watching_users_string += u.toString() + '\n'
            })
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

    export function info(msg: string) {
        return {
            embed: { color: 3447003, title: msg }
        }
    }

    export function success(msg: string) {
        return {
            embed: { color: 0x00ff22, title: msg }
        }
    }
}
