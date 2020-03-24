import {bind, BindingScope, service} from '@loopback/core';
import { OAuthServerModelProvider} from './o-auth-server-model.service';

@bind({scope: BindingScope.TRANSIENT})
export class OAuth2ServerService {
  constructor(@service(OAuthServerModelProvider) protected oAuthServerModelProvider: OAuthServerModelProvider) {

  }

  /*
   * Add service methods here
   */
}
