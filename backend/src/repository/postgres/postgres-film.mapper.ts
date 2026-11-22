import {
  FilmDto,
  FilmWithScheduleDto,
  ScheduleDto,
} from '../../films/dto/films.dto';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

export class PostgresFilmMapper {
  static toFilmDto(entity: Film): FilmDto {
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

  static toScheduleDto(entity: Schedule): ScheduleDto {
    return {
      id: entity.id,
      daytime: entity.daytime,
      hall: entity.hall,
      rows: entity.rows,
      seats: entity.seats,
      price: entity.price,
      taken: [...entity.taken],
    };
  }

  static toDto(entity: Film): FilmWithScheduleDto {
    const schedule = [...(entity.schedule ?? [])]
      .sort((left, right) => left.daytime.localeCompare(right.daytime))
      .map((item) => this.toScheduleDto(item));

    return {
      ...this.toFilmDto(entity),
      schedule,
    };
  }

  static toEntity(dto: FilmWithScheduleDto): Film {
    const film = Object.assign(new Film(), {
      id: dto.id,
      rating: dto.rating,
      director: dto.director,
      tags: [...dto.tags],
      title: dto.title,
      about: dto.about,
      description: dto.description,
      image: dto.image,
      cover: dto.cover,
    });

    film.schedule = dto.schedule.map((item) =>
      Object.assign(new Schedule(), {
        id: item.id,
        daytime: item.daytime,
        hall: item.hall,
        rows: item.rows,
        seats: item.seats,
        price: item.price,
        taken: [...item.taken],
        film,
      }),
    );

    return film;
  }
}
