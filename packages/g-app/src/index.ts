import {ApplicationConfig} from '@loopback/core';
import {GApplication} from './application';

export {GApplication};

export async function main(options: ApplicationConfig = {}) {
    const app = new GApplication(options);
    await app.boot();
    await app.start();

    const url = app.restServer.url;
    console.log(`Server is running at ${url}`);
    console.log(`Try ${url}/ping`);

    return app;
}
