import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../app.config.provider';
import { FilmsRepository } from '../repository/films.repository';
import { Film } from '../repository/postgres/entities/film.entity';
import { Schedule } from '../repository/postgres/entities/schedule.entity';
import { PostgresFilmsRepository } from '../repository/postgres/postgres-films.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => {
        const connection = config.database.url.startsWith('postgres')
          ? { url: config.database.url }
          : {
              host: config.database.host,
              port: config.database.port,
              username: config.database.username,
              password: config.database.password,
              database: config.database.name,
            };

        return {
          type: 'postgres' as const,
          ...connection,
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [
    {
      provide: FilmsRepository,
      useClass: PostgresFilmsRepository,
    },
  ],
  exports: [FilmsRepository],
})
export class PostgresDatabaseModule {}
