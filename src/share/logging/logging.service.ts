import { Logger, QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  configure,
  getLogger,
  Appender,
  Layout,
  Logger as FourLogger,
} from 'log4js';
import { getConfig } from 'src/configs/index';
import { QueryDbError } from 'src/share/constants/db.constant';

export const logConfig = {
  ...getConfig().get<any>('log'),
};

const layouts: Record<string, Layout> = {
  console: {
    type: 'pattern',
    pattern: '%[%-6p %d [%c] | %m%]',
  },
  dateFile: {
    type: 'pattern',
    pattern: '%-6p %d [%c] | %m',
  },
  access: {
    type: 'pattern',
    pattern: '%[%-6p %d [%c] | %x{remoteAddr} | %x{access}%]',
    tokens: {
      remoteAddr: function (logEvent) {
        let remoteAddr = logEvent.data.toString().split(' ', 1).pop();
        remoteAddr = remoteAddr.replace(/^.*:/, '');
        remoteAddr = remoteAddr === '1' ? '127.0.0.1' : remoteAddr;
        return remoteAddr;
      },
      access: function (logEvent) {
        const [, ...data] = logEvent.data.toString().split(' ');
        data.pop();
        return data.join(' ');
      },
    },
  },
};

const appenders: Record<string, Appender> = {
  console: {
    type: 'console',
    layout: layouts.console,
  },
  dateFile: {
    type: 'dateFile',
    filename: 'logs/out.log',
    pattern: '-yyyy-MM-dd',
    layout: layouts.dateFile,
  },
  access: {
    type: 'console',
    layout: layouts.access,
  },
  dateFileAccess: {
    type: 'dateFile',
    filename: 'logs/out.log',
    pattern: '-yyyy-MM-dd',
    layout: layouts.access,
  },
  multi: {
    type: 'multiFile',
    base: 'logs/',
    property: 'categoryName',
    extension: '.log',
  },
};

class DbLogger implements Logger {
  constructor(private logger: FourLogger) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.debug(
      `query=${query}` +
        (parameters ? ` parameters=${JSON.stringify(parameters)}` : ``),
    );
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: any,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.debug(error);
    const errorMessage = error.message ? error.message : error;
    if (Object.values(QueryDbError).includes(error.code))
      return this.logger.warn(errorMessage);

    this.logger.error(errorMessage);
    this.logger.error(
      `query=${query} parameters=${JSON.stringify(parameters)}`,
    );
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    //Notify in developer check
    this.logger.warn(
      `time=${time} query=${query} parameters=${JSON.stringify(parameters)}`,
    );
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this.logger.info(message);
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): any {
    this.logger.info(message);
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ): any {
    this.logger[level](message);
  }
}

@Injectable()
export class LoggingService {
  /**
   * config logging
   * ________________________________________
   * | NODE_ENV | DEBUG true  | DEBUG false |
   * ---------------------------------------=
   * | dev      | debug       | info        |
   * | test     | debug       | off         |
   * | product  | info        | info        |
   * ----------------------------------------
   * @example
   * Import Logging module
   * constructor(protected loggingService: LoggingService) {}
   * logger = this.loggingService.getLogger('demo');
   */
  constructor() {
    const level = logConfig.level;
    const isWriteLog = logConfig.isWriteToFile;
    configure({
      appenders: appenders,
      categories: {
        default: {
          appenders: isWriteLog ? ['console', 'dateFile'] : ['console'],
          level: level,
          enableCallStack: true,
        },
        access: {
          appenders: isWriteLog ? ['access', 'dateFileAccess'] : ['access'],
          level: 'info',
          enableCallStack: true,
        },
      },
    });
  }

  getLogger = getLogger;

  private _access = () => {
    const logger = this.getLogger('access');
    return {
      write: logger.info.bind(logger),
    };
  };

  logger = {
    default: getLogger('default'),
    access: this._access(),
    thirdParty: getLogger('thirdParty'),
  };

  getDbLogger(category: string) {
    return new DbLogger(this.getLogger(category));
  }
}
