import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'node:path';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { FilmWithScheduleDto } from './../src/films/dto/films.dto';
import { FilmsRepository } from './../src/repository/films.repository';

describe('Afisha API (e2e)', () => {
  let app: NestExpressApplication;
  let film: FilmWithScheduleDto;

  beforeAll(async () => {
    film = createFilm();

    const repository: FilmsRepository = {
      findAll: async () => {
        const { schedule, ...filmWithoutSchedule } = film;
        void schedule;
        return [filmWithoutSchedule];
      },
      findById: async (id) => (id === film.id ? film : null),
      save: async (value) => value,
      reserveSeats: async (filmId, sessionId, seats) => {
        const session = film.schedule.find((item) => item.id === sessionId);

        if (
          filmId !== film.id ||
          !session ||
          seats.some((seat) => session.taken.includes(seat))
        ) {
          return false;
        }

        session.taken.push(...seats);
        return true;
      },
      releaseSeats: async (_filmId, sessionId, seats) => {
        const session = film.schedule.find((item) => item.id === sessionId);
        if (session) {
          session.taken = session.taken.filter((seat) => !seats.includes(seat));
        }
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FilmsRepository)
      .useValue(repository)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(path.join(process.cwd(), 'public'));
    app.setGlobalPrefix('api/afisha');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/afisha/films', () => {
    return request(app.getHttpServer())
      .get('/api/afisha/films/')
      .expect(200)
      .expect((response) => {
        expect(response.body.total).toBe(1);
        expect(response.body.items[0].id).toBe(film.id);
        expect(response.body.items[0].schedule).toBeUndefined();
      });
  });

  it('GET /api/afisha/films/:id/schedule', () => {
    return request(app.getHttpServer())
      .get(`/api/afisha/films/${film.id}/schedule`)
      .expect(200)
      .expect((response) => {
        expect(response.body.total).toBe(1);
        expect(response.body.items[0].id).toBe(film.schedule[0].id);
      });
  });

  it('POST /api/afisha/order reserves a seat and rejects it next time', async () => {
    const order = [
      {
        film: film.id,
        session: film.schedule[0].id,
        row: 1,
        seat: 2,
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order)
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0]).toMatchObject({
      film: film.id,
      session: film.schedule[0].id,
      daytime: film.schedule[0].daytime,
      row: 1,
      seat: 2,
      price: film.schedule[0].price,
    });
    expect(response.body.items[0].id).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(order)
      .expect(400)
      .expect({ error: 'One or more seats are already taken' });
  });

  it('GET /content/afisha/*', () => {
    return request(app.getHttpServer())
      .get('/content/afisha/bg1s.jpg')
      .expect(200)
      .expect('Content-Type', /image\/jpeg/);
  });
});

function createFilm(): FilmWithScheduleDto {
  return {
    id: 'film-id',
    rating: 8.5,
    director: 'Director',
    tags: ['Drama'],
    title: 'Film',
    about: 'About',
    description: 'Description',
    image: '/bg1s.jpg',
    cover: '/bg1c.jpg',
    schedule: [
      {
        id: 'session-id',
        daytime: '2024-06-28T07:00:53.000Z',
        hall: 1,
        rows: 5,
        seats: 10,
        price: 350,
        taken: [],
      },
    ],
  };
}
