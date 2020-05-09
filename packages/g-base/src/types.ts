import {BindingKey} from '@loopback/core';
import {Logger} from './providers';

export namespace GBaseBinding {
  export const Logger = BindingKey.create<Logger>('provider.logger');
}
