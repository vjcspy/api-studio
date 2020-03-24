import {bind} from '@loopback/context';
import {
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec,
} from '@loopback/openapi-v3';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {service} from '@loopback/core';
import {BasicAuthUserService} from '../services';

export interface BasicAuthenticationStrategyCredentials {
  username: string;
  password: string;
}

@bind(asAuthStrategy, asSpecEnhancer)
export class BasicAuthenticationStrategy
  implements AuthenticationStrategy, OASEnhancer {
  name = 'basic';

  constructor(
    @service(BasicAuthUserService)
    private userService: BasicAuthUserService,
  ) {
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const credentials: BasicAuthenticationStrategyCredentials = this.extractCredentials(
      request,
    );
    const user = await this.userService.verifyCredentials(credentials);
    if (user === null) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }
    const userProfile = this.userService.convertToUserProfile(user);

    return userProfile;
  }

  extractCredentials(request: Request): BasicAuthenticationStrategyCredentials {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Basic Z2l6bW9AZ21haWwuY29tOnBhc3N3b3Jk
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Basic')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Basic'.`,
      );
    }

    // split the string into 2 parts. We are interested in the base64 portion
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Basic xxyyzz' where xxyyzz is a base64 string.`,
      );
    }
    const encryptedCredentails = parts[1];

    // decrypt the credentials. Should look like :   'username:password'
    const decryptedCredentails = Buffer.from(
      encryptedCredentails,
      'base64',
    ).toString('utf8');

    // split the string into 2 parts
    const decryptedParts = decryptedCredentails.split(':');

    if (decryptedParts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header 'Basic' value does not contain two parts separated by ':'.`,
      );
    }

    const creds: BasicAuthenticationStrategyCredentials = {
      username: decryptedParts[0],
      password: decryptedParts[1],
    };

    return creds;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'basic',
    });
  }
}
