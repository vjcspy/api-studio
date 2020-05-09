import {bind, /* inject, */ BindingScope, Provider} from '@loopback/core';
import winston, {format} from 'winston';
import _ from 'lodash';
import moment from 'moment';
import {isPlainObject} from '../util/is-plain-object';

/*
 * Fix the service type. Possible options can be:
 * - import {Logger} from 'your-module';
 * - export type Logger = string;
 * - export interface Logger {}
 */
export type Logger = winston.Logger;

const {combine, simple, splat, cli, errors, metadata} = format;

const FgCyan  = '\x1b[36m';
const FgGreen = '\x1b[32m';

const addTimeStamp = format((info) => {
  info.message =
    moment()
      // .tz("Asia/Ho_Chi_Minh")
      .format('YYYY-MM-DD hh:mm:ss') +
    ' : ' +
    info.message;

  return info;
});

// Ignore log messages if they have { private: true }
const formatMetadata = format((info, opts) => {
  if (info.metadata && !_.isEmpty(info.metadata)) {
    const meta = {...info.metadata};
    delete meta['metadata'];

    // const toPlainObject = (object: any): any => {
    //   if (isPlainObject(object)) {
    //     return object;
    //   }
    //
    //   if (_.isArray(object) || _.isObject(object)) {
    //     _.mapValues(object, (v) => toPlainObject(v));
    //   }
    // };

    if (!_.isEmpty(meta)) {
      // @ts-ignore
      info.message +=
        '\n\r' +
        '\n\r' +
        FgGreen +
        JSON.stringify(
          meta,
          (key, value) => {
            if (_.isString(value) && value.length >= 100) {
              return 'String(' + value.length + ')';
            }
            if (_.isArray(value)) {
              if (_.size(value) > 5) {
                return 'Array(' + _.size(value) + ')';
              } else {
                return value;
              }
            } else {
              if (
                isPlainObject(value) ||
                _.isString(value) ||
                _.isNumber(value)
              ) {
                return value;
              } else {
                return undefined;
              }
            }
          },
          4,
        ) +
        '\n\r' +
        '\x1b[0m' +
        '\n\r' +
        '=============================================================';
    }
  }
  return info;
});

@bind({scope: BindingScope.TRANSIENT})
export class LoggerProvider implements Provider<Logger> {
  protected static $INSTANCE: Logger;

  constructor(/* Add @inject to inject parameters */) {}

  value(): Logger {
    if (LoggerProvider.$INSTANCE) {
      return LoggerProvider.$INSTANCE;
    }

    const logger = winston.createLogger({
                                          level: 'silly',
                                          levels: winston.config.cli.levels,
                                          format: combine(
                                            addTimeStamp(),
                                            splat(),
                                            simple(),
                                            metadata(),
                                            errors(),
                                            formatMetadata(),
                                          ),
                                          transports: [
                                            new winston.transports.File({
                                                                          filename: '../../logs/error' + '_' + moment()
                                                                            .format('YYYY-MM-DD') + '.log',
                                                                          level: 'error',
                                                                        }),
                                            new winston.transports.File({
                                                                          filename: '../../logs/info' + '_' + moment()
                                                                            .format('YYYY-MM-DD') + '.log',
                                                                          level: 'info',
                                                                        }),
                                            new winston.transports.File({
                                                                          filename: '../../logs/debug' + '_' + moment()
                                                                            .format('YYYY-MM-DD') + '.log',
                                                                          level: 'debug',
                                                                        }),
                                            new winston.transports.File({
                                                                          filename: '../../logs/warn' + '_' + moment()
                                                                            .format('YYYY-MM-DD') + '.log',
                                                                          level: 'warn',
                                                                        }),
                                            new winston.transports.File({
                                                                          filename: '../../logs/combined' + '_' + moment()
                                                                            .format('YYYY-MM-DD') + '.log',
                                                                        }),
                                          ],
                                        });

    if (process.env.NODE_ENV !== 'production') {
      logger.add(
        new winston.transports.Console({
                                         format: combine(
                                           cli(),
                                         ),
                                       }),
      );
    }

    return LoggerProvider.$INSTANCE = logger;
  }
}
