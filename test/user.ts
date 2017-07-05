import Vuex from 'vuex';
import { action, getter, store, mutation } from '../decorators';
import { TypedStore } from '../';
import { Mutations } from '../index';

declare module '../' {
  interface Mutations {
    'user/set': IUser;
  }
  interface Actions {
    'user/create': IUser;
  }
  interface Promises {
    'user/create': IUser;
  }
  interface Getters {
    'user/fullName': string;
    'user/displayName': string;
  }
}

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
}

@store()
export default class User extends TypedStore implements IUser {
  firstName: string = null;
  lastName: string = null;
  username: string = null;

  @action('user/create')
  private create(user: IUser) {
    const p = Promise.resolve(user);
    p.then(user => this.set(user));
    return p;
  }
  
  @mutation('user/set')
  private set({firstName, lastName, username}: IUser) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
  }

  @getter('user/fullName')
  private get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @getter('user/displayName')
  private get displayName(): string {
    return `${this.fullName} (${this.username})`;
  }
}