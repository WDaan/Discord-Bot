import { isNull, isUndefined } from 'util'
import { Viewers } from './viewers.class'

const Discord = require('discord.js')
const { token } = require('./config.json')

// discord
class Discord_client {
  public discord = new Discord.Client()
  public storage_data = {
    free: '',
    daan: '',
    media: ''
  }

  public viewers: Viewers
  public watching_users_string = ''

  public msg

  constructor() {
    this.init()
    this.update_msg()
  }

  public set_user_string() {
    this.watching_users_string = ''
    if (!isUndefined(this.viewers) && !isNull(this.viewers)) {
      for (let i = 0; i < this.viewers.num; i++) {
        this.watching_users_string +=
          this.viewers.users[i].name +
          ': ' +
          this.viewers.users[i].media.type +
          '  ----  ' +
          this.viewers.users[i].media.maker +
          '  -  ' +
          this.viewers.users[i].media.title +
          '\n'
      }
    }
  }

  public write_auto_shutdown() {
    const channel = this.discord.channels.find(x => x.name === 'bot-commands')
    channel.send(this.msg.auto_shutdown)
  }

  private init() {
    this.discord.login(token)
    this.discord.once('ready', () => {
      console.log('Ready!')
    })
    this.update_msg()
  }

  public update_msg() {
    this.msg = {
      wait: 'One moment pls...',
      no_command: 'Das geen command! Kunde gij nie typen ofzo eh?!',
      supreme: 'Das enkel voor Supreme Leaders, wa hoopt gij zelf??',
      wake: {
        embed: {
          color: 3447003,
          title: 'Waking up Floki...'
        }
      },
      force_shutdown: {
        embed: {
          color: 3447003,
          title: 'Turning off Floki...'
        }
      },
      user_shutdown: {
        embed: {
          color: 3447003,
          title:
            'Server was ' +
            ' shutdown at ' +
            new Date().getHours() +
            ':' +
            new Date().getMinutes()
        }
      },
      auto_shutdown: {
        embed: {
          color: 3447003,
          title:
            'Server was auto' +
            ' shutdown at ' +
            new Date().getHours() +
            ':' +
            new Date().getMinutes()
        }
      },
      shutdown_error: {
        embed: {
          color: 0xff0000,
          title:
            'I can\'t do that, ' + this.get_num_watching() + ' still watching.'
        }
      },
      no_one_watching: {
        embed: {
          color: 0x00ff22,
          title: 'No one is watching'
        }
      },
      watching_users: {
        embed: {
          color: 3447003,
          title: this.watching_users_string
        }
      },
      alive: {
        embed: {
          color: 0x00ff22,
          title: 'Server is online ^__^'
        }
      },
      dead: {
        embed: {
          color: 0xff0000,
          title: 'Server is offline :/'
        }
      },
      info_header: {
        embed: {
          color: 3447003,
          title: '-----Server Info-----'
        }
      },
      info_music: {
        embed: {
          color: 0xe31b1b,
          title: 'Music Player',
          fields: [
            {
              name: 'Prefix : ',
              value: '$',
              inline: true
            },
            {
              name: 'Popular commands',
              value:
                '$play (link or songname)\n$pause\n$stop\n$skip\n$unpause\n$forward (getal)'
            }
          ]
        }
      },
      info_Floki: {
        embed: {
          color: 0x14d928,
          title: 'Floki',
          fields: [
            {
              name: 'Prefix : ',
              value: '!',
              inline: true
            },
            {
              name: 'Popular commands',
              value: '!meme\n!wake\n!sleep\n!storage\n!info\n!status'
            }
          ]
        }
      },
      info_meme: {
        embed: {
          color: 0x01f5fa,
          title: 'Dank Memers',
          fields: [
            {
              name: 'Prefix: ',
              value: 'pls',
              inline: true
            },
            {
              name: 'Popular commands',
              value:
                'pls meme\npls memeeconomy\npls mock (name)\npls emojify (text)\npls help image\npls help memey\npls help fun'
            }
          ]
        }
      },
      info_music_247: {
        embed: {
          color: 0x0017ff,
          title: '24/7 music',
          fields: [
            {
              name: 'Prefix: ',
              value: 'mb',
              inline: true
            },
            {
              name: 'Popular commands',
              value:
                'mb play <radiostreamlink/mp3stream/youtubelink/search>\nmb np //shows now playing\nmb streamlinks //shows available stations\nmb leave //stops music'
            }
          ]
        }
      },
      storage: {
        embed: {
          color: 3447003,
          title: 'Storage Info:',
          fields: [
            {
              name: 'Free:',
              value: this.storage_data.free + ' Gb',
              inline: true
            },
            {
              name: 'Daan:',
              value: this.storage_data.daan + ' Gb',
              inline: true
            },
            {
              name: 'Media:',
              value: this.storage_data.media + ' Gb',
              inline: true
            }
          ]
        }
      }
    }
  }

  private get_num_watching() {
    if (!isUndefined(this.viewers) && !isNull(this.viewers)) {
      return this.viewers.num
    }
  }
}

export const discord_client = new Discord_client()
