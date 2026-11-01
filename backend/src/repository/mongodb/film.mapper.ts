import {
  FilmDto,
  FilmWithScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';
import { FilmEntity, ScheduleEntity } from './film.schema';

export class FilmMapper {
  static toFilmDto(entity: FilmEntity): FilmDto {
    return {
      id: entity.id,
      rating: entity.rating,
      director: entity.director,
      tags: [...entity.tags],
      title: entity.title,
      about: entity.about,
      description: entity.description,
      image: entity.image,
      cover: entity.cover,
    };
  }

  static toScheduleDto(entity: ScheduleEntity): ScheduleDto {
    return {
      id: entity.id,
      daytime: entity.daytime.toISOString(),
      hall: String(entity.hall),
      rows: entity.rows,
      seats: entity.seats,
      price: entity.price,
      taken: [...entity.taken],
    };
  }

  static toDto(entity: FilmEntity): FilmWithScheduleDto {
    return {
      ...this.toFilmDto(entity),
      schedule: entity.schedule.map((item) => this.toScheduleDto(item)),
    };
  }

  static toEntity(dto: FilmWithScheduleDto): FilmEntity {
    return {
      id: dto.id,
      rating: dto.rating,
      director: dto.director,
      tags: [...dto.tags],
      title: dto.title,
      about: dto.about,
      description: dto.description,
      image: dto.image,
      cover: dto.cover,
      schedule: dto.schedule.map((item) => ({
        id: item.id,
        daytime: new Date(item.daytime),
        hall: Number(item.hall),
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: [...item.taken],
      })),
    };
  }
}
