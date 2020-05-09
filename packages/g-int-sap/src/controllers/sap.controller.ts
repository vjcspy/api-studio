// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {Request, RestBindings, get, ResponseObject, param} from '@loopback/rest';
import {inject} from '@loopback/core';
import {SapMongoDataSource} from '../datasources';

export class SapController {
  constructor(
    @inject('datasources.SapMongo') protected dataSource: SapMongoDataSource,
  ) {}

  @get('/sap/pull')
  test(
    @param({
             name: 'entity_type',
             required: true,
             in: 'query',
           }) type: string,
    @param.query.string('time', {
      required: true,
    }) time: number,
    @param.query.string('currentPage', {
      required: true,
    }) currentPage: number,
    @param.query.string('pageSize', {
      required: true,
    }) pageSize: number,
  ): object {
    return {
      type,
      time,
      currentPage,
      pageSize,
      mongoConfig: this.dataSource.settings,
    };
  }
}
