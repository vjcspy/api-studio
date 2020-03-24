import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {BaseComponent, BaseSequence, bootComponents} from '@vjcspy/g-base';
import _ from 'lodash';
import path from 'path';
import {OAuth2ServerProvider} from './services';
import {registerAuthenticationStrategy} from '@loopback/authentication';
import {BasicAuthenticationStrategy} from './strategies';
import {JWTAuthenticationStrategy} from './strategies/jwt-trategy';

export class GApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  components = [
    BaseComponent,
  ];

  services: [
    OAuth2ServerProvider
  ];

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(BaseSequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.js'],
        nested: true,
      },
    };

    // Add strategy to extensionPoint
    registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Call function from base module, it will load dependent component
    bootComponents(this, this.components);

    this._registerServices();
  }

  protected _registerServices() {
    _.each(this.services, (service: any) => this.service(service));
  }
}
