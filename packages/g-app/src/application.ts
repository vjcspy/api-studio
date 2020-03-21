import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
    RestExplorerBindings,
    RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {GBaseComponent} from "@vjcspy/g-base";
import _ from 'lodash';
import path from 'path';
import {MySequence} from './sequence';

export class GApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
) {
    components: [
        GBaseComponent
    ];

    constructor(options: ApplicationConfig = {}) {
        super(options);

        // Set up the custom sequence
        this.sequence(MySequence);

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
        };

        this._registerComponents();
    }

    protected _registerComponents() {
        _.each(this.components, (component: any) => this.component(component));
    }
}
