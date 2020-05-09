import {Component, ProviderMap} from '@loopback/core';
import {AuthenticationComponent} from '@loopback/authentication';
import {hasDependentComponent} from './decorators';
import {LoggerProvider} from './providers';
import {GBaseBinding} from './types';

@hasDependentComponent
export class BaseComponent implements Component {

  static COMPONENTS = [
    AuthenticationComponent,
  ];

  constructor() {
  }

  providers?: ProviderMap = {
    [GBaseBinding.Logger.key]: LoggerProvider,
  };
}
