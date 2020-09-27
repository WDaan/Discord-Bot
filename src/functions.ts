import ping from 'ping'
import { asyncExec as exec } from 'async-shelljs'
import axios from 'axios'

require('dotenv').config()

import { MSG } from './messages'
import { Media, User, Viewers } from './models'

export namespace FUN {
    export async function wake() {
        return await exec(
            `wakeonlan -i ${process.env.WAKEONLAN_IP} ${process.env.SERVER_MAC}`
        )
    }

    export async function shutdown() {
        await exec(
            `sshpass -p '${process.env.SERVER_PASS}' ssh ${process.env.SERVER_USER}@${process.env.SERVER_IP} 'echo ${process.env.SERVER_PASS} | sudo -S docker kill (docker ps -a -q)`
        )
        return await exec(
            `sshpass -p '${process.env.SERVER_PASS}' ssh ${process.env.SERVER_USER}@${process.env.SERVER_IP} 'echo ${process.env.SERVER_PASS} | sudo -S shutdown now`
        )
    }

    export async function status() {
        if (await is_alive()) {
            const viewers: Viewers[] | any = await check_plex()
            if (viewers && viewers.num) {
                return Promise.resolve(MSG.watching_users(viewers))
            }

            return Promise.resolve(MSG.no_one_watching())
        }

        return Promise.resolve(MSG.dead())
    }

    export async function sleep() {
        if (await is_alive()) {
            const viewers: any = await check_plex()

            if (viewers && viewers.num) {
                return Promise.resolve(MSG.shutdown_error(viewers.num))
            }

            // if number of viewers is 0, server can shutdown
            await shutdown()
            return Promise.resolve(MSG.user_shutdown())
        }

        return Promise.resolve({
            embed: {
                color: 3447003,
                title: `${process.env.SERVER_NAME} was already offline...`
            }
        })
    }

    // automatic sleep
    export async function autosleep(discord) {
        console.log('trying to auto shutdown -- ' + new Date().toUTCString())
        const viewers: any = await check_plex()

        if (!viewers) {
            console.log('server already offline')
        }

        if (viewers && viewers.num == 0) {
            shutdown()
            MSG.auto_shutdown(discord)
        }
    }
}

function is_alive() {
    return ping.promise.probe(process.env.SERVER_IP).then(res => res.alive)
}

// PLEX RELATED FUNCTIONS

async function check_plex() {
    if (await is_alive()) {
        const viewers = await request_plex_xml()
        return Promise.resolve(viewers)
    }

    return false
}

// request the whole xml from plex
async function request_plex_xml() {
    const url = `http://${process.env.SERVER_IP}:32400/status/sessions?X-Plex-Token=${process.env.PLEX_TOKEN}`
    const { data } = await axios.get(url)

    return parse_plex_json(data.MediaContainer)
}

// get the number of users, en userdata if necessary
function parse_plex_json(MediaContainer): Viewers {
    let viewers = new Viewers()
    viewers.num = MediaContainer.size
    if (MediaContainer.size > 0) {
        viewers = parse_user_info(MediaContainer.Metadata, viewers)
    }
    return viewers
}

// get the name & info of the active plex users
function parse_user_info(Metadata, viewers: Viewers): Viewers {
    Metadata.forEach(element => {
        let m: Media
        let usr: User
        switch (element.type) {
            case 'track':
                m = new Media('Music', element.grandparentTitle, element.title)
                break
            case 'movie':
                m = new Media('Movie', '', element.title)
                break
            case 'episode':
                m = new Media(
                    'Serie',
                    element.grandparentTitle,
                    element.title + getSeasonString(element)
                )
                break
            default:
                break
        }
        usr = new User(element.User.title, m)
        viewers.add_user(usr)
    })

    return viewers
}

function getSeasonString(media) {
    return ` (S${media.parentIndex}E${media.index})`
}
