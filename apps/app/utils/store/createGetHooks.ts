import Dispatcher from './dispatcher';
import { Hooks } from './types';

function createGetHooks<Hs extends Hooks = Hooks>(dispatcher: Dispatcher) {
  return function<K extends keyof Hs>(namespace: K): ReturnType<Hs[K]> {
    return dispatcher.data[namespace];
  };
}

export default createGetHooks;