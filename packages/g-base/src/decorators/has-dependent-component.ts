import {Application, BindingKey} from '@loopback/core';
import 'reflect-metadata';
import * as _ from 'lodash';

export const BINDING_KEY_COMPONENT_HAS_DEPENDENT = BindingKey.create<string>('BINDING_KEY_COMPONENT_HAS_DEPENDENT');

export function hasDependentComponent<T extends {new(...args: any[]): {}}>(constructor: T) {
  // @ts-ignore
  if (constructor.COMPONENTS === undefined) {
    throw Error('please define static COMPONENTS');
  }
  Reflect.defineMetadata(BINDING_KEY_COMPONENT_HAS_DEPENDENT.key, true, constructor);
  return class extends constructor {
    public static registerDependentComponent(app: Application) {
      // @ts-ignore
      _.each(constructor.COMPONENTS, c => app.component(c));
    }
  };
}
