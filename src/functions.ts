import ping from 'ping'
import { asyncExec as exec } from 'async-shelljs'

require('dotenv').config()

import { MSG } from './messages'
import { Viewers } from './models'
import { getPlexData } from './plex'

export namespace FUN {
    export async function wake() {
        if (!(await is_alive())) {
            await exec(
                `wakeonlan -i ${process.env.WAKEONLAN_IP} ${process.env.SERVER_MAC}`
            )
            return false
        }

        return true //allready awake
    }

    export async function shutdown() {
        if (await is_alive()) {
            await exec(
                `sshpass -p '${process.env.SERVER_PASS}' ssh ${process.env.SERVER_USER}@${process.env.SERVER_IP} 'echo ${process.env.SERVER_PASS} | 
sudo -S docker kill (docker ps -a -q)'`
            )

            //wait 20s for dockers to stop
            await waitFor(20000)

            return exec(
                `sshpass -p '${process.env.SERVER_PASS}' ssh ${process.env.SERVER_USER}@${process.env.SERVER_IP} 'echo ${process.env.SERVER_PASS} | 
sudo -S shutdown now'`
            )
        }

        return true //allready shutdown
    }

    export async function status() {
        if (await is_alive()) {
            const viewers: Viewers[] | any = await checkPlex()
            if (viewers && viewers.num) {
                return MSG.watching_users(viewers)
            }

            return MSG.no_one_watching()
        }

        return MSG.dead()
    }

    export async function sleep() {
        if (await is_alive()) {
            const viewers: any = await checkPlex()

            if (viewers && viewers.num) {
                return MSG.shutdown_error(viewers.num)
            }

            // if number of viewers is 0, server can shutdown
            return shutdown()
        }

        return MSG.info(`${process.env.SERVER_NAME} was already offline...`)
    }

    // automatic sleep
    export async function autosleep(discord) {
        console.log('trying to auto shutdown -- ' + new Date().toUTCString())
        const viewers: any = await checkPlex()

        if (!viewers) {
            console.log('server already offline')
        }

        if (viewers && viewers.num == 0) {
            shutdown()
            MSG.auto_shutdown(discord)
        }
    }

    export function is_alive() {
        return ping.promise.probe(process.env.SERVER_IP).then(res => res.alive)
    }

    async function checkPlex() {
        if (await is_alive()) {
            return getPlexData()
        }

        return false
    }
}

export function waitFor(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
