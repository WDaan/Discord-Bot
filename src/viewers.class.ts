import {User} from './user.class';
export class Viewers {
  public num: number;
  public users: User[];

  constructor() {
    this.num = 0;
    this.users = [];
  }

  public add_user(usr: User) {
    this.users.push(usr);
  }

  public get_users(): User[] {
    return this.users;
  }
}
