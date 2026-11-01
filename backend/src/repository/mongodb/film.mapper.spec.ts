import { FilmWithScheduleDto } from '../../films/dto/films.dto';
import { FilmMapper } from './film.mapper';
import { filmSchema } from './film.schema';

describe('FilmMapper', () => {
  const film: FilmWithScheduleDto = {
    id: 'film-id',
    rating: 8.5,
    director: 'Director',
    tags: ['Drama'],
    title: 'Film',
    about: 'About',
    description: 'Description',
    image: '/film-small.jpg',
    cover: '/film-cover.jpg',
    schedule: [
      {
        id: 'session-id',
        daytime: '2024-06-28T07:00:53.000Z',
        hall: 2,
        rows: 5,
        seats: 10,
        price: 350,
        taken: ['1:2'],
      },
    ],
  };

  it('converts a DTO to a MongoDB entity', () => {
    const entity = FilmMapper.toEntity(film);

    expect(entity.schedule[0].daytime).toBeInstanceOf(Date);
    expect(entity.schedule[0].hall).toBe(2);
  });

  it('converts a MongoDB entity to a DTO', () => {
    const dto = FilmMapper.toDto(FilmMapper.toEntity(film));

    expect(dto).toEqual(film);
  });

  it('uses films as the collection and embeds schedule documents', () => {
    expect(filmSchema.get('collection')).toBe('films');
    expect(filmSchema.path('schedule')).toBeDefined();
  });
});
