import {bind, BindingScope, Provider} from '@loopback/core';
import OAuth2Server = require('oauth2-server');
import {Getter, repository} from '@loopback/repository';
import {OAuthClientRepository, OAuthTokenRepository, UserRepository} from '../../repositories';
import {OAuthToken} from '../../models';
import * as _ from 'lodash';

/*
 * Fix the service type. Possible options can be:
 * - import {OAuth2Server} from 'your-module';
 * - export type OAuth2Server = string;
 * - export interface OAuth2Server {}
 */

@bind({scope: BindingScope.TRANSIENT})
export class OAuth2ServerProvider implements Provider<OAuth2Server> {
  constructor(
    @repository.getter('UserRepository')
    public getUserRepository: Getter<UserRepository>,
    @repository.getter('OAuthTokenRepository')
    public getOAuthTokenRepository: Getter<OAuthTokenRepository>,
    @repository.getter('OAuthClientRepository')
    public getOAuthClientRepository: Getter<OAuthClientRepository>,
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
        console.info('getAccessToken' + access_token);
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        return oauthTokenRepo.findOne({where: {access_token}});
      },

      getClient: async (client_id: string, client_secret: string) => {
        console.info('getClient');
        const oauthClientRepo = await this.getOAuthClientRepository();
        const client = await oauthClientRepo.findOne({
          where: {client_id, client_secret},
          include: [{relation: 'grants'}],
        });
        if (client) {
          const grants: any = [];
          _.each(client.grants, (g) => grants.push(g.type));
          return {
            clientId: client_id,
            clientSecret: client_secret,
            grants,
          };
        }
        return false;
      },

      getRefreshToken: async (refresh_token: string) => {
        console.info('getRefreshToken');
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        return oauthTokenRepo.findOne({where: {refresh_token}});
      },

      /*
      * Su dung trong Password Grant de verify xem nguoi  dung co ton tai  khong
      * */
      getUser: async (username: string, password: string) => {
        console.info('getUser');
        const userRepo = await this.getUserRepository();
        return userRepo.findOne({where: {username, password}});
      },

      saveToken: async (token: any, client: any, user: any) => {
        console.info('saveToken');
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        const oAuthTokenData = {
          access_token: token.accessToken,
          access_token_expires_on: token.accessTokenExpiresOn,
          client_id: client.client_id,
          refresh_token: token.refreshToken,
          refresh_token_expires_on: token.refreshTokenExpiresOn,
          user_id: user.id,
        };
        await oauthTokenRepo.save(new OAuthToken(oAuthTokenData));

        return {...token, userId: user.id, clientId: client.client_id, client, user};
      },

      saveAuthorizationCode: async (code: string, client: any, user: any) => {

      },
    };
  }
}
