import { FilmDto, FilmWithScheduleDto } from '../films/dto/films.dto';

export abstract class FilmsRepository {
  abstract findAll(): Promise<FilmDto[]>;

  abstract findById(id: string): Promise<FilmWithScheduleDto | null>;

  abstract save(film: FilmWithScheduleDto): Promise<FilmWithScheduleDto>;

  abstract reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean>;

  abstract releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void>;
}
