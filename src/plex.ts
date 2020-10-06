import axios from 'axios'
import { Media, User, Viewers } from './models'
import { MSG } from './messages'
// PLEX RELATED FUNCTIONS

// request the whole xml from plex
export async function getPlexData() {
    const url = `http://${process.env.SERVER_IP}:32400/status/sessions?X-Plex-Token=${process.env.PLEX_TOKEN}`
    return axios
        .get(url)
        .then(res => parse_plex_json(res.data.MediaContainer))
        .catch(e => MSG.error('Plex is not running'))
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
