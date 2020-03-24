// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, post} from '@loopback/openapi-v3';
import {service} from '@loopback/core';
import {OAuth2ServerProvider} from '../services';
import OAuth2Server = require('oauth2-server');
import {inject} from '@loopback/context';
import {Request, RestBindings} from '@loopback/rest';

export class AuthController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @service(OAuth2ServerProvider) public oAuth2Server: OAuth2Server,
  ) {
  }

  @post('/auth/generate-otp')
  generateOtp() {
    return 'otp';
  }

  @get('/auth/get-token')
  async getToken() {
    const {Request, Response} = OAuth2Server;
    try {
      const result = await this.oAuth2Server.token(new Request(this.req), new Response());
      return result;
    } catch (e) {
      let a = 1;
    }

  }
}
