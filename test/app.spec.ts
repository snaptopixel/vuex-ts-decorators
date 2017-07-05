import { TypedStore } from './../index';
import App from './app';
import Vuex, {StoreOptions} from 'vuex';

import { expect } from 'chai';
import { mapGetter, mapAction, mapMutation } from '../decorators';
import { IUser } from './user';

describe('vuex-iq', () => {
  const store = new Vuex.Store(App as any) as TypedStore;

  store.subscribe((m, s) => {
    console.log('subs', m, s);
  });

  store.subscribeAction((m, s) => {
    console.log('act', m, s);
  });

  store.watch(state => {
    return state.user.firstName;
  }, (value, oldvalue) => {
    console.log('first', value, oldvalue);
  });

  it('can create store via @store decorator', () => {
    // App moduleZ
    const appOpts = App as StoreOptions<App>;
    expect(appOpts.modules).to.be.an.instanceof(Object);
    expect(appOpts.actions).to.be.an.instanceof(Object);
    expect(appOpts.mutations).to.be.an.instanceof(Object);
    expect(appOpts.getters).to.be.an.instanceof(Object);
    expect(appOpts.getters['app/hasUser']).to.be.an.instanceOf(Function);
    // User module
    const userOpts = appOpts.modules.user;
    expect(userOpts.modules).to.be.undefined;
    expect(userOpts.actions).to.be.an.instanceof(Object);
    expect(userOpts.mutations).to.be.an.instanceof(Object);
    expect(userOpts.getters).to.be.an.instanceof(Object);
    expect(userOpts.getters['user/fullName']).to.be.an.instanceOf(Function);
    expect(userOpts.getters['user/displayName']).to.be.an.instanceOf(Function);
    expect(userOpts.mutations['user/set']).to.be.an.instanceOf(Function);
    expect(userOpts.actions['user/create']).to.be.an.instanceOf(Function);
  });

  it('can return promise and trigger mutation via @action decorator', done => {
    store.dispatch('user/create', { // Dispatch type and payload are properly type-checked
      firstName: 'Joe',
      lastName: 'Shmoe',
      username: '@shmoe'
    }).then(user => { // Promise result is properly typed as well
      expect(store.state.user).to.deep.eq(user); // State is mutated appropriately
      done();
    }).catch(done);
  });

  it('can read state in getter via @getter decorator', () => {
    expect(store.getters['app/hasUser']).to.be.true; // Getters can read state
    expect(store.getters['user/fullName']).to.eq('Joe Shmoe'); // Getters have access to child state
  });

  it('can access other getter in getter via @getter decorator', () => {
    expect(store.getters['user/displayName']).to.eq('Joe Shmoe (@shmoe)'); // Getters have access to other getters
  });

  it('can change state via @mutation decorator', () => {
    const bob = {firstName: 'Bob', lastName: 'Dobalina', username: '@bob'};
    store.commit('user/set', bob);
    expect(store.state.user).not.to.eq(bob);
    expect(store.state.user).to.deep.eq(bob);
  });

  it('can map getter via @mapGetter decorator', () => {
    class MyThing {
      @mapGetter('user/displayName')
      displayName: string;
    }
    const instance = new MyThing();
    expect(Object.getOwnPropertyDescriptor(MyThing.prototype, 'displayName').get).to.be.an.instanceof(Function); // Should be a getter
    expect(instance.displayName).to.eq(store.getters['user/displayName'])
  });

  it('can map action via @mapAction decorator', done => {
    class MyThing {
      @mapAction('user/create')
      createUser: (user: IUser) => Promise<IUser>;
    }
    const instance = new MyThing();
    instance.createUser({firstName: 'Napolean', lastName: 'Dynamite', username: '@gosh'})
    .then(user => { // Promise result is properly typed as well
      expect(store.state.user).to.deep.eq(user); // State is mutated appropriately
      done();
    }).catch(done);
  });

});