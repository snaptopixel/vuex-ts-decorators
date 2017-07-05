
// This is the root store for our tests

import Vuex from 'vuex';
import { action, getter, store, mutation } from '../decorators';
import { TypedStore } from '../';
import User, { IUser } from './user';

declare module '../' {
  // Make sure we get typing on 'state' this should only be done in the root store
  interface State {
    user: IUser;
  }
  interface Getters {
    'app/hasUser': Boolean;
  }
}

@store({
  modules: { user: User }
})
export default class App extends TypedStore {
  // Declare submodules to get types on `state`
  user: User = null;

  @getter('app/hasUser')
  private get hasUser() {
    return !!this.user.firstName;
  }
}