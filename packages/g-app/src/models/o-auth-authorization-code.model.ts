import {belongsTo, Entity, model, property} from '@loopback/repository';
import {OAuthClient} from './o-auth-client.model';
import {User} from './user.model';

@model({settings: {strict: false}})
export class OAuthAuthorizationCode extends Entity {
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
                  columnName: 'authorization_code',
                  dataType: 'VARCHAR',
                  dataLength: 50,
                  nullable: 'N',
                },
            })
  authorizationCode: string;

  @property({
              type: 'date',
              required: true,
              mysql:
                {
                  columnName: 'expires_at',
                  dataType: 'DATETIME',
                  nullable: 'N',
                },
            })
  expiresAt: string;

  @property({
              type: 'string',
              mysql:
                {
                  columnName: 'redirect_uri',
                  dataType: 'TEXT',
                  nullable: 'Y',
                },
            })
  redirectUri?: string;

  @property({
              type: 'string',
              mysql:
                {
                  columnName: 'scope',
                  dataType: 'TEXT',
                  nullable: 'Y',
                },
            })
  scope?: string;

  @belongsTo(() => OAuthClient, {name: 'client', keyFrom: 'clientId', keyTo: 'clientId'}, {
    type: 'string',
    mysql:
      {
        columnName: 'client_id',
        dataType: 'VARCHAR',
        dataLength: 50,
        nullable: 'N',
      },
  })
  clientId: string;

  @belongsTo(() => User, {name: 'user'}, {
    type: 'number',
    mysql:
      {
        columnName: 'user_id',
        dataType: 'INT',
        nullable: 'N',
      },
  })
  userId: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OAuthAuthorizationCode>) {
    super(data);
  }
}

export interface OAuthAuthorizationCodeRelations {
  client?: OAuthClient;
  user?: User
}

export type OAuthAuthorizationCodeWithRelations = OAuthAuthorizationCode & OAuthAuthorizationCodeRelations;
