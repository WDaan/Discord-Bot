// storage
export class StorageInfo {
  constructor(public free: string, public daan: string, public media: string) {}
}

// media
export class Media {
  constructor(public type: string, public maker: string, public title: string) {}
}

// user class
export class User {
  constructor(public name: string, public media: Media) {
    if (name.length > 7) {
      name = name.substr(0, 6)
    }
  }
}

// viewers
export class Viewers {
  public num: number = 0
  public users: User[] = []

  public add_user(usr: User) {
    this.users.push(usr)
  }

  public get_users(): User[] {
    return this.users
  }
}
