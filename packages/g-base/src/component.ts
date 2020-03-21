import {Component, ProviderMap} from '@loopback/core';

export class GBaseComponent implements Component {
    constructor() {
    }

    providers?: ProviderMap = {};

}
