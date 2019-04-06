import {Media} from './media.class';

// user class
export class User {
  constructor(public name: string, public media: Media) {
    if (name.length > 7) {
      name = name.substr(0, 6);
    }
  }
}
