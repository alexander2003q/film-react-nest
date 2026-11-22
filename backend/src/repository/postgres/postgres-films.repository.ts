import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FilmDto, FilmWithScheduleDto } from '../../films/dto/films.dto';
import { FilmsRepository } from '../films.repository';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { PostgresFilmMapper } from './postgres-film.mapper';

@Injectable()
export class PostgresFilmsRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find({
      order: { title: 'ASC' },
    });

    return films.map((film) => PostgresFilmMapper.toFilmDto(film));
  }

  async findById(id: string): Promise<FilmWithScheduleDto | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
    });

    return film ? PostgresFilmMapper.toDto(film) : null;
  }

  async save(film: FilmWithScheduleDto): Promise<FilmWithScheduleDto> {
    const savedFilm = await this.dataSource.transaction(async (manager) => {
      const filmRepository = manager.getRepository(Film);
      const scheduleRepository = manager.getRepository(Schedule);

      await scheduleRepository
        .createQueryBuilder()
        .delete()
        .where('"filmId" = :filmId', { filmId: film.id })
        .execute();

      return filmRepository.save(PostgresFilmMapper.toEntity(film));
    });

    return PostgresFilmMapper.toDto(savedFilm);
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Schedule);
      const schedule = await this.findScheduleForUpdate(
        repository,
        filmId,
        sessionId,
      );

      if (!schedule || seats.some((seat) => schedule.taken.includes(seat))) {
        return false;
      }

      schedule.taken = [...new Set([...schedule.taken, ...seats])];
      await repository.save(schedule);
      return true;
    });
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Schedule);
      const schedule = await this.findScheduleForUpdate(
        repository,
        filmId,
        sessionId,
      );

      if (!schedule) {
        return;
      }

      const releasedSeats = new Set(seats);
      schedule.taken = schedule.taken.filter(
        (seat) => !releasedSeats.has(seat),
      );
      await repository.save(schedule);
    });
  }

  private findScheduleForUpdate(
    repository: Repository<Schedule>,
    filmId: string,
    sessionId: string,
  ): Promise<Schedule | null> {
    return repository
      .createQueryBuilder('schedule')
      .innerJoin('schedule.film', 'film')
      .where('schedule.id = :sessionId', { sessionId })
      .andWhere('film.id = :filmId', { filmId })
      .setLock('pessimistic_write')
      .getOne();
  }
}
