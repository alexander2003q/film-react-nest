import { ConfigService } from '@nestjs/config';

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: createAppConfig,
};

export interface AppConfig {
  port: number;
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: DatabaseDriver;
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export type DatabaseDriver = 'mongodb' | 'postgres';

export function createAppConfig(configService: ConfigService): AppConfig {
  const port = Number(configService.get<string>('PORT', '3000'));
  const databasePort = Number(
    configService.get<string>('DATABASE_PORT', '5432'),
  );

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  if (
    !Number.isInteger(databasePort) ||
    databasePort < 1 ||
    databasePort > 65535
  ) {
    throw new Error('DATABASE_PORT must be an integer between 1 and 65535');
  }

  const driver = parseDatabaseDriver(
    configService.get<string>('DATABASE_DRIVER', 'mongodb'),
  );
  const url = configService.get<string>(
    'DATABASE_URL',
    'mongodb://localhost:27017/prac',
  );
  const defaultHost =
    driver === 'postgres' && !url.includes('://') ? url : 'localhost';

  return {
    port,
    database: {
      driver,
      url,
      host: configService.get<string>('DATABASE_HOST', defaultHost),
      port: databasePort,
      username: configService.get<string>('DATABASE_USERNAME', 'prac'),
      password: configService.get<string>('DATABASE_PASSWORD', 'prac'),
      name: configService.get<string>('DATABASE_NAME', 'prac'),
    },
  };
}

export function parseDatabaseDriver(value: string): DatabaseDriver {
  if (value !== 'mongodb' && value !== 'postgres') {
    throw new Error('DATABASE_DRIVER must be either "mongodb" or "postgres"');
  }

  return value;
}
