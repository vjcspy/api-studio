import {Application} from '@loopback/core';
import 'reflect-metadata';
import _ from 'lodash';
import {BINDING_KEY_COMPONENT_HAS_DEPENDENT} from '../decorators';

export function bootComponents(app: Application, componentsConstructor: any[]) {
  _.each(componentsConstructor, (c: any) => {
    const hasDependent = Reflect.getMetadata(BINDING_KEY_COMPONENT_HAS_DEPENDENT.key, c);
    if (hasDependent) {
      c.registerDependentComponent(app);
    }
  });
}
