import {queueDecorator} from './module';

function factory(target: any, name: string, method: Function): any {
  queueDecorator((store: any) => {
    store.actions = store.actions || {};
    store.actions[name] = (context: any, ...args: any[]) => {
      const scope = {
        commit: (...args: any[]) => context.commit(...args),
        dispatch: (...args: any[]) => context.dispatch(...args),
        rootState: context.rootState,
        rootGetters: context.rootGetters,
        ...context.state,
        ...context.getters,
      };
      return method.apply(scope, args);
    }
  });
}

export default function action(...opts: any[]) {
  if (typeof opts[0] === 'object') {
    return factory(opts[0], opts[1], opts[0][opts[1]]);
  } else {
    return (target: any, propKey: string) => {
      return factory(target, opts[0], target[propKey]);
    }
  }
}