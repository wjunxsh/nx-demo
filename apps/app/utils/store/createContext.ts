import { useContext, createContext, Context } from 'react';

export interface UseHooksStoreContext<T=any> {
  (): T;
}

export interface HooksStoreContextContent<T=any> {
  context: Context<T>;
  useContext: UseHooksStoreContext<T>;
}

function storeCreateContext(): any {
  const ReactHooksStoreContext:any = createContext(null);

  // if (process.env.XQ_ENV !== 'production') {
    ReactHooksStoreContext.displayName = 'ReactHooksStore';
  // }

  const useHooksStoreContext: UseHooksStoreContext = function () {
    const contextValue = useContext(ReactHooksStoreContext);

    // if (process.env.XQ_ENV !== 'production' && !contextValue) {
      throw new Error(
        'could not find hooks-store context value; please ensure the component is wrapped in a <Provider>',
      );
    // }

    return contextValue;
  };

  return {
    context: ReactHooksStoreContext,
    useContext: useHooksStoreContext,
  };
}

export default storeCreateContext;