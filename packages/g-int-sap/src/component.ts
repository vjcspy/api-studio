import {Component, ProviderMap} from '@loopback/core';
import {SapController} from './controllers';

export class GIntSapComponent implements Component {
  constructor() {}

  controllers = [
    SapController,
  ];

  providers?: ProviderMap = {};

}
