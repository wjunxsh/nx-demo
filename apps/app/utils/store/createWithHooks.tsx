import React from 'react';
import { Hooks } from './types';

type Optionalize<T extends K, K> = Omit<T, keyof K>;

 function createWithHooks<Ms extends Hooks = Hooks>(useHooks:any) {
  return function withHooks<
    K extends keyof Ms,
    M extends (hooks: ReturnType<Ms[K]>) => Record<string, any>
  >(namespace: any, mapHooksToProps?: any) {
    mapHooksToProps = (mapHooksToProps || ((hooks: ReturnType<Ms[K]>) => ({ [namespace]: hooks }))) as M;
    return <R extends ReturnType<typeof mapHooksToProps>, P extends R>(Component: React.ComponentType<P>) => {
      return (props: Optionalize<P, R>): React.ReactElement => {
        const value = useHooks(namespace);
        const withProps = mapHooksToProps(value);
        return (
          <Component
            {...withProps}
            {...(props as P)}
          />
        );
      };
    };
  };
}
export default createWithHooks;