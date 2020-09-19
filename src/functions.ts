const ping = require('ping')
const request = require('request-promise')
const convert_xml = require('xml-js')

const shell = require('shelljs')

const { server_ip, plex_token, cmd_shutdown, cmd_wakeonlan } = require('./config.json')
import { MSG } from './messages'
import { Media, User, Viewers } from './models'

export namespace FUN {
  export function wake() {
    shell.exec(cmd_wakeonlan)
  }

  export async function shutdown() {
    shell.exec(cmd_shutdown)
  }

  export async function status() {
    if ((await is_alive()) === true) {
      return new Promise(async (resolve, reject) => {
        const viewers: Viewers[] | any = await check_plex()
        // tslint:disable-next-line: triple-equals
        if (viewers.num == 0) {
          resolve(MSG.no_one_watching())
        } else {
          resolve(MSG.watching_users(viewers))
        }
      })
    } else {
      return new Promise(async (resolve, reject) => {
        resolve(MSG.dead())
      })
    }
  }

  export async function sleep() {
    if ((await is_alive()) === true) {
      return new Promise(async (resolve, reject) => {
        const viewers: any = await check_plex()
        // if number of viewers is 0, server can shutdown
        if (viewers.num == 0) {
          shutdown()
          resolve(MSG.user_shutdown())
        } else {
          resolve(MSG.shutdown_error(viewers.num))
        }
      })
    } else {
      // should fix the error i guess :p
      return new Promise(async (resolve, reject) => resolve('Server was already offline...'))
    }
  }

  // automatic sleep
  export async function autosleep(discord) {
    console.log('trying to auto shutdown -- ' + new Date().toUTCString())
    const viewers: any = await check_plex()
    if (viewers === 'offline') {
      console.log('server already offline')
    } else {
      if (viewers.num == 0) {
        shutdown()
        MSG.auto_shutdown(discord)
      }
    }
  }
}

async function is_alive() {
  const _alive = await ping.promise.probe(server_ip)
  const { alive } = _alive
  return alive
}

// PLEX RELATED FUNCTIONS

async function check_plex() {
  if ((await is_alive()) === true) {
    return new Promise(async (resolve, reject) => {
      const viewers = await request_plex_xml()
      resolve(viewers)
      reject('something went wrong')
    })
  } else {
    return 'offline'
  }
}

// request the whole xml from plex
async function request_plex_xml() {
  let json
  // request the data
  await request(
    {
      url: 'http://' + server_ip + ':32400/status/sessions?X-Plex-Token=' + plex_token,
      json: false,
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        // convert xml to json
        const result = convert_xml.xml2json(body, {
          compact: true,
          spaces: 4,
        })
        json = JSON.parse(result)
      }
    },
  )
  return parse_plex_json(json)
}

// get the number of users, en userdata if necessary
function parse_plex_json(json): Viewers {
  let viewers = new Viewers()
  const num_active_users = json.MediaContainer._attributes.size
  viewers.num = num_active_users
  if (num_active_users > 0) {
    viewers = parse_user_info(json, viewers)
  }
  return viewers
}

// get the name of the active plex users
function parse_user_info(json, viewers: Viewers): Viewers {
  // parse songs
  try {
    const Tracks = json.MediaContainer.Track
    let nTrack = Tracks.length
    if (nTrack === undefined) {
      nTrack = 1
    }
    if (nTrack === 1) {
      const m = get_maker(Tracks)
      const usr = new User(Tracks.User._attributes.title, m)
      viewers.add_user(usr)
    } else if (nTrack > 1) {
      for (let i = 0; i < nTrack; i++) {
        const m = get_maker(Tracks[i])
        const usr = new User(Tracks[i].User._attributes.title, m)
        viewers.add_user(usr)
      }
    }
  } catch (err) {
    // console.log('no songs');
  }

  // parse videos
  try {
    const Videos = json.MediaContainer.Video
    let nVideo = Videos.length
    if (nVideo === undefined) {
      nVideo = 1
    }
    // console.log("Videos: " + nVideo);
    if (nVideo === 1) {
      const m = get_maker(Videos)
      const usr = new User(Videos.User._attributes.title, m)
      viewers.add_user(usr)
    } else if (nVideo > 1) {
      for (let i = 0; i < nVideo; i++) {
        const m = get_maker(Videos[i])
        const usr = new User(Videos[i].User._attributes.title, m)
        viewers.add_user(usr)
      }
    }
  } catch (err) {
    // console.log('no vids');
  }
  return viewers
}

// get info on the media that's playing
function get_maker(info): Media {
  let maker: string
  let title
  let type
  switch (info._attributes.type) {
    case 'track':
      type = 'Music'
      maker = info._attributes.grandparentTitle
      title = info._attributes.title
      break
    case 'episode':
      type = 'Serie'
      maker = info._attributes.grandparentTitle
      maker +=
        ' (' +
        info._attributes.parentTitle.substring(0, 1) +
        info._attributes.parentTitle.substring(
          info._attributes.parentTitle.length - 2,
          info._attributes.parentTitle.length,
        ) +
        'E' +
        info._attributes.index +
        ')'
      title = info._attributes.title
      break
    case 'movie':
      type = 'Movie'
      maker = info._attributes.title
      title = ''
      break
  }
  return new Media(type, maker, title)
}

function system_sleep(s: number) {
  let ms = s * 1000
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
