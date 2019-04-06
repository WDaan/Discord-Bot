"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
