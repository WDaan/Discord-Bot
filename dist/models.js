"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// storage
class StorageInfo {
    constructor(free, daan, media) {
        this.free = free;
        this.daan = daan;
        this.media = media;
    }
}
exports.StorageInfo = StorageInfo;
// media
class Media {
    constructor(type, maker, title) {
        this.type = type;
        this.maker = maker;
        this.title = title;
    }
}
exports.Media = Media;
// user class
class User {
    constructor(name, media) {
        this.name = name;
        this.media = media;
        if (name.length > 7) {
            name = name.substr(0, 6);
        }
    }
}
exports.User = User;
// viewers
class Viewers {
    constructor() {
        this.num = 0;
        this.users = [];
    }
    add_user(usr) {
        this.users.push(usr);
    }
    get_users() {
        return this.users;
    }
}
exports.Viewers = Viewers;
