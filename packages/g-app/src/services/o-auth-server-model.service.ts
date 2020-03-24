import {bind, BindingScope, inject, Provider} from '@loopback/core';
import {OAuthClientRepository, OAuthTokenRepository, UserRepository} from '../repositories';
import {Getter, repository} from '@loopback/repository';
import {OAuthToken, OAuthTokenWithRelations} from '../models';

/*
 * Fix the service type. Possible options can be:
 * - import {OAuthServerModel} from 'your-module';
 * - export type OAuthServerModel = string;
 * - export interface OAuthServerModel {}
 */
export type OAuthServerModel = any;

@bind({scope: BindingScope.TRANSIENT})
export class OAuthServerModelProvider implements Provider<OAuthServerModel> {
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

    // Add your implementation here
    return {
      getAccessToken: async (access_token: string) => {
        console.info('getAccessToken' + access_token);
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        return oauthTokenRepo.findOne({where: {access_token}});
      },
      getClient: async (client_id: string, client_secret: string) => {
        console.info('getClient');
        const oauthClientRepo = await this.getOAuthClientRepository();
        return oauthClientRepo.findOne({where: {client_id, client_secret}});
      },
      getRefreshToken: async (refresh_token: string) => {
        console.info('getRefreshToken');
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        return oauthTokenRepo.findOne({where: {refresh_token}});
      },
      getUser: async (username: string, password: string) => {
        console.info('getUser');
        const userRepo = await this.getUserRepository();
        return userRepo.findOne({where: {id: 1}});
      },
      saveToken: async (token: any, client: any, user: any) => {
        console.info('saveToken');
        const oauthTokenRepo = await this.getOAuthTokenRepository();
        const oAuthTokenData = {
          access_token: token.accessToken,
          access_token_expires_on: token.accessTokenExpiresOn,
          o_auth_client: client,
          client_id: client.clientId,
          refresh_token: token.refreshToken,
          refresh_token_expires_on: token.refreshTokenExpiresOn,
          user,
          user_id: user.id,
        };
        await oauthTokenRepo.save(new OAuthToken(oAuthTokenData));


        return oAuthTokenData;
      },
    };
  }
}
