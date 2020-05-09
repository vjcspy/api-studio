// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {get, post, requestBody} from '@loopback/openapi-v3';
import {inject} from '@loopback/core';
import {SapMongoDataSource} from '../datasources';

export class SapController {
  constructor(
    @inject('datasources.SapMongo') dataSource: SapMongoDataSource,
  ) {}

  @get('/sap/dump-db')
  test(): object {
    return {
      message: 'Hello',
    };
  }
}
