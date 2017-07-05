import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';
import {
  Actions,
  Getters,
  Mutations,
  TypedStore
  } from './index';
import { copyOwnProperties, ModuleScope } from './utils';
import { createDecorator } from 'vue-class-component';

Vue.use(Vuex);

// Child decorators execute first so we have to queue factory functions
// in order to define things on the store/module instance
let queuedDecorators: ((store: any, scope: ModuleScope) => void)[] = [];

// We need a reference to the root store for dispatching and commiting
// so we use a simple plugin to get it
let rootStore: TypedStore;
function initPlugin(store: TypedStore) {
  rootStore = store;
}

export function store(config: {
  // `namespaced` is intentionally NOT supported
  // IMHO the decorators do it better, you just need to make sure your
  // getters, mutations and actions have unique names
  modules?: Object;
} = {}) {
  // queuedDecorators has already been populated at this point by the child decorators,
  // so we cache it and reinitialize for the next @module
  const decorators = queuedDecorators;
  queuedDecorators = [];
  return (target: any) => {
    const scope = new ModuleScope();
    // This is the actual StoreOptions object that the class is replaced with in output
    const store: any = {
      state: {},
      modules: config.modules,
      actions: {},
      mutations: {},
      getters: {},
      plugins: [initPlugin] // Add the plugin to every module, since we don't know which will be the root store
    };
    // Copy any state properties off of the instance
    const instance = new target();
    copyOwnProperties(instance, store.state);
    // Configure the store, now that it exists
    decorators.forEach(callback => callback(store, scope));
    return store;
  }
}

export function getter(name: keyof Getters) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      Object.defineProperty(scope.getters, propertyKey, descriptor);
      store.getters[name] = (state: any, getters: any, rootState: any, rootGetters: any) => {
        return descriptor.get && descriptor.get.apply(scope.getterScope(state, rootState, rootGetters));
      }
    });
  }
}

export function action(name: keyof Actions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      scope.actions[propertyKey] = (payload: any) => {
        rootStore.dispatch(name, payload);
      };
      store.actions[name] = (context: ActionContext<any, any>, ...args: any[]) => {
        return descriptor.value.apply(scope.actionScope(context), args);
      }
    });
  }
}

export function mutation(name: keyof Mutations) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    queuedDecorators.push((store: any, scope: ModuleScope) => {
      scope.mutations[propertyKey] = (payload: any) => {
        rootStore.commit(name, payload);
      };
      store.mutations[name] = (state: any, ...args: any[]) => {
        descriptor.value.apply(state, args);
      }
    });
  }
}

export function mapGetter(name: keyof Getters) {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: () => rootStore.getters[name]
    });
  }
}

export function mapAction(name: keyof Actions) {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = payload => rootStore.dispatch(name, payload);
  }
}

export function mapMutation(name: keyof Mutations) {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = payload => rootStore.commit(name, payload);
  }
}