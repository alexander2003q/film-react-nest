import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmsResponseDto> {
    const items = await this.filmsRepository.findAll();

    return {
      total: items.length,
      items,
    };
  }

  async findSchedule(filmId: string): Promise<ScheduleResponseDto> {
    const film = await this.filmsRepository.findById(filmId);

    if (!film) {
      throw new NotFoundException({ error: 'Film not found' });
    }

    return {
      total: film.schedule.length,
      items: film.schedule,
    };
  }
}
