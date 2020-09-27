import { GuardFunction } from '@typeit/discord'

export const NotBot: GuardFunction<'message'> = async (
    [message],
    client,
    next
) => {
    if (client.user.id !== message.author.id) {
        await next()
    }
}

export const HasPermission: GuardFunction<'message'> = async (
    [message],
    client,
    next
) => {
    if (message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        await next()
    }
}
