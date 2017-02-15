import {queueDecorator} from './module';

function factory(target: any, name: string, method: Function): any {
  queueDecorator((store) => {
    store.actions = store.actions || {};
    store.actions[name] = (context, ...args) => {
      const scope = {
        commit: (...args) => context.commit(...args),
        rootState: context.rootState,
        rootGetters: context.rootGetters,
        ...store.state,
        ...store.getters,
      };
      return method.apply(scope, args);
    }
  });
}

export default function action(...opts) {
  if (typeof opts[0] === 'object') {
    return factory(opts[0], opts[1], opts[0][opts[1]]);
  } else {
    return (target: any, propKey: string) => {
      return factory(target, opts[0], target[propKey]);
    }
  }
}