"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
