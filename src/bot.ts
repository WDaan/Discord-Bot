import {
    Discord,
    Command,
    Once,
    CommandNotFound,
    On,
    Guard,
    ArgsOf
} from '@typeit/discord'
import { Message } from 'discord.js'


import { MSG } from './messages'
import { FUN, waitFor } from './functions'
import { NotBot, HasPermission } from './permissions'


@Discord(process.env.PREFIX)
abstract class Bot {

    @Once('ready')
    ready() {
        console.log('Ready!')
    }

    @On('message')
    @Guard(NotBot, HasPermission)
    async onMessage([message]: ArgsOf<'message'>) { }

    @Command('test')
    async test(message: Message) {
        message.channel.send('test')
    }

    @Command('time')
    async time(message: Message) {
        message.channel.send(MSG.info(`Current time is: ${new Date().toLocaleTimeString()}`))
    }

    @Command('wake')
    async wake(message: Message) {
        const channel = message.channel
        channel.send(MSG.info(`Waking up ${process.env.SERVER_NAME}...`))
        if (await FUN.wake())
            return channel.send(
                MSG.success(`${process.env.SERVER_NAME} is already online 😀`)
            )

        await waitFor(30000)

        const alive = await FUN.is_alive()
        return alive ? channel.send(MSG.wakeSuccesfull()) : MSG.command_failed()
    }

    @Command('forcesleep')
    async forcesleep(message: Message) {
        const channel = message.channel
        channel.send(MSG.info(`Turning off ${process.env.SERVER_NAME}...`))
        if (await FUN.shutdown())
            return channel.send(
                MSG.success(`${process.env.SERVER_NAME} is already offline`)
            )

        await waitFor(30000)

        const alive = await FUN.is_alive()
        return alive
            ? channel.send(MSG.shutdownSuccesfull())
            : MSG.command_failed()
    }

    @Command('sleep')
    async sleep(message: Message) {
        const channel = message.channel
        channel.send(MSG.wait())
        if (await FUN.sleep())
            return channel.send(
                MSG.success(`${process.env.SERVER_NAME} is already offline`)
            )

        await waitFor(60000)

        const alive = await FUN.is_alive()
        return alive ? channel.send(MSG.user_shutdown()) : MSG.command_failed()
    }

    @Command('status')
    async status(message: Message) {
        const channel = message.channel
        channel.send(MSG.wait())
        channel.send(await FUN.status())
    }

    @Command('info')
    info(message: Message) {
        const channel = message.channel
        channel.send(MSG.info_header())
        channel.send(MSG.info_music())
        channel.send(MSG.info_Floki())
        channel.send(MSG.info_meme())
        channel.send(MSG.info_music_247())
    }

    @CommandNotFound()
    commandNotFound(message: Message) {
        message.channel.send(
            MSG.info('Das geen command! Kunde gij nie typen ofzo eh?!')
        )
    }
}
