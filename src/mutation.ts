import {queueDecorator} from './module';

function factory(target: any, name: string, method: Function): any {
  queueDecorator((store) => {
    store.mutations = store.mutations || {};
    store.mutations[name] = (state, ...args) => {
      method.apply(store.state, args);
    }
  });
}

export default function mutation(...opts) {
  if (typeof opts[0] === 'object') {
    return factory(opts[0], opts[1], opts[0][opts[1]]);
  } else {
    return (target: any, propKey: string) => {
      return factory(target, opts[0], target[propKey]);
    }
  }
}