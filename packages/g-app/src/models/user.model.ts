import {Entity, model, property, hasOne} from '@loopback/repository';
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
    'type': 'Date',
    'required': false,
    'length': null,
    'precision': null,
    'scale': null,
    'mysql': {
      'columnName': 'created_at',
      'dataType': 'datetime',
      'dataLength': null,
      'dataPrecision': null,
      'dataScale': null,
      'nullable': 'Y',
    },
  })
  created_at?: Date;

  @property({
    'type': 'Date',
    'required': false,
    'length': null,
    'precision': null,
    'scale': null,
    'mysql': {
      'columnName': 'last_modified_at',
      'dataType': 'datetime',
      'dataLength': null,
      'dataPrecision': null,
      'dataScale': null,
      'nullable': 'Y',
    },
  })
  last_modified_at?: Date;

  @hasOne(() => OAuthToken, {keyTo: 'user_id'})
  o_auth_token?: OAuthToken;

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
