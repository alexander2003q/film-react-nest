import { ConfigService } from '@nestjs/config';
import { createAppConfig, parseDatabaseDriver } from './app.config.provider';

describe('app configuration', () => {
  it('uses MongoDB defaults', () => {
    const config = createAppConfig(new ConfigService());

    expect(config.database.driver).toBe('mongodb');
    expect(config.database.url).toBe('mongodb://localhost:27017/prac');
  });

  it('reads PostgreSQL connection settings', () => {
    const config = createAppConfig(
      new ConfigService({
        DATABASE_DRIVER: 'postgres',
        DATABASE_URL: 'db.internal',
        DATABASE_PORT: '5433',
        DATABASE_USERNAME: 'film',
        DATABASE_PASSWORD: 'secret',
        DATABASE_NAME: 'film',
      }),
    );

    expect(config.database).toMatchObject({
      driver: 'postgres',
      host: 'db.internal',
      port: 5433,
      username: 'film',
      password: 'secret',
      name: 'film',
    });
  });

  it('rejects unsupported database drivers', () => {
    expect(() => parseDatabaseDriver('mysql')).toThrow(
      'DATABASE_DRIVER must be either "mongodb" or "postgres"',
    );
  });
});
