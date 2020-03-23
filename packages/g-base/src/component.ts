import {Component, ProviderMap} from '@loopback/core';
import {AuthenticationComponent} from '@loopback/authentication';
import {hasDependentComponent} from './decorators';

@hasDependentComponent
export class BaseComponent implements Component {

  static COMPONENTS = [
    AuthenticationComponent,
  ];

  constructor() {
  }

  providers?: ProviderMap = {};
}
