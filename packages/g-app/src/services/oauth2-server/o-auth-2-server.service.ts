import {bind, BindingScope, Provider} from '@loopback/core';
import OAuth2Server = require('oauth2-server');
import {Getter, repository} from '@loopback/repository';
import {
  OAuthAuthorizationCodeRepository,
  OAuthClientRepository,
  OAuthTokenRepository,
  UserRepository,
} from '../../repositories';
import {OAuthAuthorizationCode, OAuthToken} from '../../models';
import * as _ from 'lodash';

/*
 * Fix the service type. Possible options can be:
 * - import {OAuth2Server} from 'your-module';
 * - export type OAuth2Server = string;
 * - export interface OAuth2Server {}
 */

@bind({scope: BindingScope.TRANSIENT})
export class OAuth2ServerProvider implements Provider<OAuth2Server> {
  // fake uri
  static REDIRECT_URIS = [
    'https://ggg.com.vn',
  ];

  constructor(
    @repository.getter('UserRepository')
    public getUserRepository: Getter<UserRepository>,
    @repository.getter('OAuthTokenRepository')
    public getOAuthTokenRepository: Getter<OAuthTokenRepository>,
    @repository.getter('OAuthClientRepository')
    public getOAuthClientRepository: Getter<OAuthClientRepository>,
    @repository.getter('OAuthAuthorizationCodeRepository')
    public getOAuthAuthorizationCodeRepository: Getter<OAuthAuthorizationCodeRepository>,
  ) {
  }

  value() {
    return new OAuth2Server({
                              model: this.model(),
                            });
  }

  protected model(): any {
    return {
      getAccessToken: async (access_token: string) => {
        const oauthTokenRepo = await this.getOAuthTokenRepository();

        return oauthTokenRepo.findOne({where: {access_token}});
      },

      getClient: async (clientId: string, clientSecret: string) => {
        if (!clientSecret) {
          const buff        = new Buffer(clientId, 'base64');
          const idSecretStr = buff.toString('ascii');
          const idSecretArr = idSecretStr.split(':');
          if (_.size(idSecretArr) === 2) {
            clientId     = idSecretArr[0];
            clientSecret = idSecretArr[1];
          }
        }

        const oauthClientRepo = await this.getOAuthClientRepository();
        const client          = await oauthClientRepo.findOne({
                                                                where: {clientId, clientSecret},
                                                                include: [{relation: 'grants'}],
                                                              });
        const redirectUris    = client === null || !client.hasOwnProperty('redirectUris') ? OAuth2ServerProvider.REDIRECT_URIS : client['redirectUris'];

        if (client) {
          const grants: any = [];
          _.each(client.grants, (g) => grants.push(g.type));
          return {
            id: clientId,
            clientId,
            grants,
            redirectUris,
          };
        }

        return false;
      },

      getRefreshToken: async (refreshToken: string) => {
        const oauthTokenRepo = await this.getOAuthTokenRepository();

        return oauthTokenRepo.findOne({where: {refreshToken}});
      },

      /*
      * Su dung trong Password Grant de verify xem nguoi  dung co ton tai  khong
      * */
      getUser: async (username: string, password: string) => {
        const userRepo = await this.getUserRepository();
        const user     = await userRepo.findOne({where: {username, password}});

        if (user) {
          return {
            id: user.id,
            userId: user.id,
            phone: user.phone,
          };
        }
        return false;
      },

      saveToken: async (token: any, client: any, user: any) => {
        const oauthTokenRepo = await this.getOAuthTokenRepository();

        return {
          ...await oauthTokenRepo.save(new OAuthToken({...token, clientId: client.clientId, userId: user.userId})),
          client,
          user,
        };
      },

      // when user get new token
      revokeToken: async (token: any) => {
        const oauthTokenRepo = await this.getOAuthTokenRepository();

        return !!await oauthTokenRepo.deleteAll({
                                                  accessToken: token.accessToken,
                                                });
      },

      // generateAuthorizationCode(client: any, user: any, scope: any) {
      //
      // },

      saveAuthorizationCode: async (code: object, client: any, user: any) => {
        const oAuthAuthorizationCodeRepository = await this.getOAuthAuthorizationCodeRepository();

        return {
          ...await oAuthAuthorizationCodeRepository.save(new OAuthAuthorizationCode({
                                                                                      ...code,
                                                                                      clientId: client.clientId,
                                                                                      userId: user.id,
                                                                                    })),
          client,
          user,
        };
      },

      getAuthorizationCode: async (authorizationCode: string) => {
        const oAuthAuthorizationCodeRepository = await this.getOAuthAuthorizationCodeRepository();

        const code = await oAuthAuthorizationCodeRepository.findOne({
                                                                      where: {authorizationCode},
                                                                      include: [
                                                                        {
                                                                          relation: 'user', scope: {
                                                                            fields: {
                                                                              phone: true,
                                                                              id: true,
                                                                            },
                                                                          },
                                                                        },
                                                                        {
                                                                          relation: 'client',
                                                                          scope: {
                                                                            fields: {
                                                                              id: true,
                                                                              clientId: true,
                                                                            },
                                                                          },
                                                                        },
                                                                      ],
                                                                    });

        if (!!code && !!code.client) {
          // @ts-ignore fix error in node_modules/oauth2-server/lib/grant-types/authorization-code-grant-type.js:106
          code.client.id   = code.client.clientId;
          // @ts-ignore fix error in node_modules/oauth2-server/lib/grant-types/authorization-code-grant-type.js:138
          code.redirectUri = false;
          return {...code, code: code.authorizationCode};
        }
        return false;
      },

      revokeAuthorizationCode: async (code: any) => {
        const oAuthAuthorizationCodeRepository = await this.getOAuthAuthorizationCodeRepository();

        return oAuthAuthorizationCodeRepository.deleteAll({
                                                            authorizationCode: code.authorizationCode,
                                                          });
      },
    };
  }
}
