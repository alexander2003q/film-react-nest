import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { FilmDto, FilmWithScheduleDto } from '../../films/dto/films.dto';
import { FilmsRepository } from '../films.repository';
import { FilmMapper } from './film.mapper';
import { FilmEntity, filmSchema } from './film.schema';
import { MongoConnection } from './mongo.connection';

@Injectable()
export class MongoFilmsRepository implements FilmsRepository {
  private modelPromise: Promise<Model<FilmEntity>> | null = null;

  constructor(private readonly mongoConnection: MongoConnection) {}

  async findAll(): Promise<FilmDto[]> {
    const model = await this.getModel();
    const films = await model.find().sort({ title: 1 }).exec();

    return films.map((film) => FilmMapper.toFilmDto(film));
  }

  async findById(id: string): Promise<FilmWithScheduleDto | null> {
    const model = await this.getModel();
    const film = await model.findOne({ id }).exec();

    return film ? FilmMapper.toDto(film) : null;
  }

  async save(film: FilmWithScheduleDto): Promise<FilmWithScheduleDto> {
    const model = await this.getModel();
    const savedFilm = await model
      .findOneAndUpdate({ id: film.id }, FilmMapper.toEntity(film), {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      })
      .exec();

    return FilmMapper.toDto(savedFilm);
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    const model = await this.getModel();
    const result = await model
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $nin: seats },
            },
          },
        },
        {
          $addToSet: {
            'schedule.$.taken': { $each: seats },
          },
        },
        { runValidators: true },
      )
      .exec();

    return result.modifiedCount === 1;
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    const model = await this.getModel();
    await model
      .updateOne(
        { id: filmId, 'schedule.id': sessionId },
        { $pullAll: { 'schedule.$.taken': seats } },
      )
      .exec();
  }

  private getModel(): Promise<Model<FilmEntity>> {
    if (!this.modelPromise) {
      this.modelPromise = this.mongoConnection
        .getConnection()
        .then((connection) =>
          connection.models.Film
            ? (connection.models.Film as Model<FilmEntity>)
            : connection.model<FilmEntity>('Film', filmSchema),
        )
        .catch((error) => {
          this.modelPromise = null;
          throw error;
        });
    }

    return this.modelPromise;
  }
}
