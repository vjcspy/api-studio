import {bind, BindingScope} from '@loopback/core';
import {User} from '../../models';
import {repository} from '@loopback/repository';
import {UserRepository} from '../../repositories';
import {UserProfile, securityId} from '@loopback/security';
import {UserService} from '@loopback/authentication';
import {HttpErrors} from '@loopback/rest';
import {BasicAuthenticationStrategyCredentials} from '../../strategies';
import {randomString} from '@vjcspy/g-base';

@bind({scope: BindingScope.TRANSIENT})
export class BasicAuthUserService implements UserService<User, BasicAuthenticationStrategyCredentials> {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  async verifyCredentials(
    credentials: BasicAuthenticationStrategyCredentials,
  ): Promise<User> {
    if (!credentials) {
      throw new HttpErrors.Unauthorized(`'credentials' is null`);
    }

    if (!credentials.username) {
      throw new HttpErrors.Unauthorized(`'credentials.username' is null`);
    }

    if (!credentials.password) {
      throw new HttpErrors.Unauthorized(`'credentials.password' is null`);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        username: credentials.username,
      },
    });

    if (foundUser === null) {
      throw new HttpErrors.Unauthorized(
        `User with username ${credentials.username} not found.`,
      );
    }

    // if (credentials.password !== foundUser.password) {
    //   throw new HttpErrors.Unauthorized('The password is not correct.');
    // }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    if (!user) {
      throw new HttpErrors.Unauthorized(`'user' is null`);
    }

    if (!user.id) {
      throw new HttpErrors.Unauthorized(`'user id' is null`);
    }

    return {
      [securityId]: randomString(),
      username: user.username,
    };
  }
}
