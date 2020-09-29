import schedule from 'node-schedule'
import { FUN } from './functions'

export class Scheduler {
    private static instance: Scheduler
    public client
    private autosleepJob

    constructor(discord) {
        if (!Scheduler.instance) {
            this.initializeClient(discord)
        }
    }

    static getInstance(discord = null): Scheduler {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler(discord)
        }
        return Scheduler.instance
    }

    initializeClient(discord) {
        if (!discord) return
        this.initializeJob()
        this.client = discord
    }

    initializeJob() {
        this.autosleepJob = schedule.scheduleJob(
            {
                hour: 17,
                minute: 3
            },
            () => {
                //FUN.autosleep(this.client) // first check
                //const channel = this.client.channels.find(x => x.name === 'bot-commands')
                //channel.send('test')
                // const startTime = new Date(Date.now())
                // const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000)
                // schedule.scheduleJob(
                //     {
                //         start: startTime,
                //         end: endTime,
                //         rule: '*/10 * * * *'
                //     },
                //     () => {
                //         //FUN.autosleep(this.client) // recheck every 10 min
                //     }
                // )
            }
        )
    }
}
