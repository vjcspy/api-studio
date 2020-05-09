import {Component, ProviderMap} from '@loopback/core';
import {SapController} from './controllers';
import {SapMongoDataSource} from './datasources';

export class GIntSapComponent implements Component {
  constructor() {}

  controllers = [
    SapController,
  ];

  providers?: ProviderMap = {};

  classes = {
    'datasources.SapMongo': SapMongoDataSource,
  };
}
