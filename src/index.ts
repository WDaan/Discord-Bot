import { Client } from '@typeit/discord'
require('dotenv').config()

async function start() {
    const client = new Client({
        classes: [`${__dirname}/bot.ts`],
        silent: false,
        variablesChar: ':'
    })

    await client.login(process.env.DISCORD_TOKEN)
}

start()
