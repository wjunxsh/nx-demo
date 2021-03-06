import React, { Context } from 'react';
import Executor from './executor';
import Dispatcher from './dispatcher';
import { Hooks } from './types';

const Provider = (context: Context<Dispatcher>, dispatcher: Dispatcher, hooks: Hooks) => {
  return ({ children }: { children: React.ReactNode }) => {
    return (
      <context.Provider value={dispatcher}>
        {Object.keys(hooks).map(namespace => {
          const useValue = hooks[namespace];
          return (
            <Executor
              key={namespace}
              namespace={namespace}
              useValue={useValue}
              onUpdate={(val:any) => {
                dispatcher.data[namespace] = val;
                dispatcher.update(namespace);
              }}
            />
          );
        })}
        {children}
      </context.Provider>
    );
  };
}

export default Provider;