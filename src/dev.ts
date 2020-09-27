import { FUN } from './functions'

import { asyncExec as exec, cp } from 'async-shelljs'

const command = process.argv[2] || null

const start = async () => {
    if (command) {
        if (FUN[command] instanceof Function) {
            console.log(`executing: ${FUN[command].toString()}`)
            const res = await FUN[command]()
            return console.log(res)
        }
        if (command === 'env') {
            console.log(process.env)
        }

        const res = await exec(command)
        console.log(res)
    }
}

start()
