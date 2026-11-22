import { Module } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import { MongoFilmsRepository } from '../repository/mongodb/mongo-films.repository';
import { MongoConnection } from '../repository/mongodb/mongo.connection';

@Module({
  providers: [
    MongoConnection,
    {
      provide: FilmsRepository,
      useClass: MongoFilmsRepository,
    },
  ],
  exports: [FilmsRepository],
})
export class MongoDatabaseModule {}
