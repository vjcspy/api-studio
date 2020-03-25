import {belongsTo, Entity, model, property} from '@loopback/repository';
import {OAuthClient} from './o-auth-client.model';
import {User, UserWithRelations} from './user.model';

@model({settings: {strict: false}})
export class OAuthToken extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    mysql:
      {
        columnName: 'access_token',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  accessToken: string;

  @property({
    type: 'date',
    mysql:
      {
        columnName: 'access_token_expires_at',
        dataType: 'DATETIME',
        nullable: 'N',
      },
  })
  accessTokenExpiresAt?: Date;

  @property({
    type: 'string',
    mysql:
      {
        columnName: 'refresh_token',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  refreshToken?: string;

  @property({
    type: 'date',
    mysql:
      {
        columnName: 'refresh_token_expires_at',
        dataType: 'DATETIME',
        nullable: 'N',
      },
  })
  refreshTokenExpiresAt?: Date;

  @belongsTo(() => User, {name: 'user'}, {
    type: 'number',
    mysql:
      {
        columnName: 'user_id',
        dataType: 'INT',
        dataLength: 50,
        nullable: 'N',
      },
  })
  userId?: number;

  @belongsTo(() => OAuthClient, {name: 'client'}, {
    type: 'string',
    mysql:
      {
        columnName: 'client_id',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  clientId?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OAuthToken>) {
    super(data);
  }
}

export interface OAuthTokenRelations {
  user?: UserWithRelations;
  client?: OAuthClient
}

export type OAuthTokenWithRelations = OAuthToken & OAuthTokenRelations;
