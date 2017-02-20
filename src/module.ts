import * as Vue from 'vue';
import * as Vuex from 'vuex';

Vue.use(Vuex);

const storeInstance = new Vuex.Store({});

function mapProperties(target: any, store: any) {
  const instance = new target();
  const keys = Object.getOwnPropertyNames(instance).filter(key => !(key in storeInstance));
  keys.forEach(key => { store.state[key] = instance[key] });
}

function mapGetters(target: any, store: any) {
  const keys = Object.getOwnPropertyNames(target.prototype).filter(key => !(key in Vuex.Store.prototype));
  keys.forEach(key => {
    const desc = Object.getOwnPropertyDescriptor(target.prototype, key);
    if(desc.get) {
      store.getters = store.getters || {};
      store.getters[key] = (state: any, getters: any, rootState: any, rootGetters: any) => {
        const scope = {
          ...store.getters,
          ...store.state,
          rootState,
          rootGetters,
        };
        return desc.get.apply(scope);
      }
    }
  });
}

let decoratorQueue: Function[] = [];

export function factory(target: Function, config?: any): any {
  const store: any = {
    state: {}
  };
  if (config.modules) { store.modules = config.modules; }
  if (config.namespaced) { store.namespaced = true; }
  mapProperties(target, store);
  mapGetters(target, store);
  config.decorators.forEach((callback: Function) => callback(store));
  if (config.store) {
    return new Vuex.Store(store);
  } else {
    return store;
  }
}

export function queueDecorator(callback: Function) {
  decoratorQueue.push(callback);
}

type ModuleConfig = {
  store?: boolean;
  modules?: Object;
}

function Module(opts:ModuleConfig|Function) {
  const decorators = decoratorQueue;
  decoratorQueue = [];
  if (typeof opts === 'function') {
    return factory.bind(null, opts, {decorators});
  } else {
    return (target: any) => {
      return factory.bind(null, target, {...opts, decorators});
    }
  }
}

export default Module;