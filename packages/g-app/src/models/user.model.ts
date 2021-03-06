import {Entity, model, property, hasMany} from '@loopback/repository';
import {OAuthAuthorizationCode} from './o-auth-authorization-code.model';
import {OAuthToken} from './o-auth-token.model';

@model({settings: {strict: false}})
export class User extends Entity {
  @property({
              type: 'number',
              id: true,
              generated: true,
            })
  id?: string;

  @property({
              type: 'string',
              required: true,
              length: 20,
              mysql: {
                columnName: 'phone',
                dataType: 'VARCHAR',
                dataLength: 20,
                nullable: 'N',
              },
            })
  phone: string;

  @property({
              type: 'string',
              required: true,
              length: 20,
              mysql: {
                columnName: 'username',
                dataType: 'VARCHAR',
                dataLength: 20,
                nullable: 'Y',
              },
            })
  username: string;

  @property({
              type: 'string',
              required: true,
              length: 20,
              mysql: {
                columnName: 'password',
                dataType: 'VARCHAR',
                dataLength: 20,
                nullable: 'Y',
              },
            })
  password: string;

  @property({
              'type': 'Date',
              'required': false,
              'length': null,
              'precision': null,
              'scale': null,
              'default': () => new Date(),
              'mysql': {
                'columnName': 'created_at',
                'dataType': 'datetime',
                'dataLength': null,
                'dataPrecision': null,
                'dataScale': null,
                'nullable': 'Y',
              },
            })
  createdAt?: Date;

  @property({
              'type': 'Date',
              'required': false,
              'length': null,
              'precision': null,
              'scale': null,
              'default': () => new Date(),
              'mysql': {
                'columnName': 'last_modified_at',
                'dataType': 'datetime',
                'dataLength': null,
                'dataPrecision': null,
                'dataScale': null,
                'nullable': 'Y',
              },
            })
  lastModifiedAt?: Date;

  @hasMany(() => OAuthToken, {keyTo: 'userId'})
  tokens?: OAuthToken[];

  @hasMany(() => OAuthAuthorizationCode, {keyTo: 'userId'})
  authorizationCodes: OAuthAuthorizationCode[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
