import { FilmWithScheduleDto } from '../../films/dto/films.dto';
import { commaSeparatedListTransformer } from './entities/comma-separated-list.transformer';
import { PostgresFilmMapper } from './postgres-film.mapper';

describe('PostgresFilmMapper', () => {
  const film: FilmWithScheduleDto = {
    id: '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf',
    rating: 8.5,
    director: 'Director',
    tags: ['Drama', 'Recommended'],
    title: 'Film',
    about: 'About',
    description: 'Description',
    image: '/film-small.jpg',
    cover: '/film-cover.jpg',
    schedule: [
      {
        id: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
        daytime: '2024-06-28T10:00:53+03:00',
        hall: 2,
        rows: 5,
        seats: 10,
        price: 350,
        taken: ['1:2', '2:3'],
      },
    ],
  };

  it('converts a DTO to linked TypeORM entities and back', () => {
    const entity = PostgresFilmMapper.toEntity(film);

    expect(entity.schedule[0].film).toBe(entity);
    expect(PostgresFilmMapper.toDto(entity)).toEqual(film);
  });

  it('maps comma-separated SQL columns to arrays', () => {
    expect(commaSeparatedListTransformer.to(film.tags)).toBe(
      'Drama,Recommended',
    );
    expect(commaSeparatedListTransformer.from('1:2,2:3')).toEqual([
      '1:2',
      '2:3',
    ]);
    expect(commaSeparatedListTransformer.from('')).toEqual([]);
  });
});
