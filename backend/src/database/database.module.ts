import { DynamicModule } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';
import { MongoDatabaseModule } from './mongodb-database.module';
import { PostgresDatabaseModule } from './postgres-database.module';

export class DatabaseModule {
  static register(): Array<Promise<DynamicModule>> {
    return [
      ConditionalModule.registerWhen(
        MongoDatabaseModule,
        (environment) =>
          (environment.DATABASE_DRIVER ?? 'mongodb') === 'mongodb',
      ),
      ConditionalModule.registerWhen(
        PostgresDatabaseModule,
        (environment) => environment.DATABASE_DRIVER === 'postgres',
      ),
    ];
  }
}
