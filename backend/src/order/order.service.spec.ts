import { BadRequestException } from '@nestjs/common';
import { FilmWithScheduleDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';
import { OrderDto } from './dto/order.dto';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let film: FilmWithScheduleDto;
  let repository: jest.Mocked<FilmsRepository>;
  let service: OrderService;

  beforeEach(() => {
    film = createFilm();
    repository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(film),
      save: jest.fn(),
      reserveSeats: jest.fn().mockResolvedValue(true),
      releaseSeats: jest.fn().mockResolvedValue(undefined),
    };
    service = new OrderService(repository);
  });

  it('reserves seats and returns canonical session data', async () => {
    const order = createOrder([
      { film: film.id, session: 'session-1', row: 1, seat: 2 },
    ]);

    const result = await service.create(order);

    expect(repository.reserveSeats).toHaveBeenCalledWith(film.id, 'session-1', [
      '1:2',
    ]);
    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      film: film.id,
      session: 'session-1',
      daytime: film.schedule[0].daytime,
      row: 1,
      seat: 2,
      price: film.schedule[0].price,
    });
    expect(result.items[0].id).toEqual(expect.any(String));
  });

  it('rejects duplicate seats in one order', async () => {
    const ticket = { film: film.id, session: 'session-1', row: 1, seat: 2 };

    await expectBadRequest(service.create(createOrder([ticket, ticket])));
    expect(repository.reserveSeats).not.toHaveBeenCalled();
  });

  it('rejects seats outside the hall', async () => {
    const order = createOrder([
      { film: film.id, session: 'session-1', row: 6, seat: 1 },
    ]);

    await expectBadRequest(service.create(order));
    expect(repository.reserveSeats).not.toHaveBeenCalled();
  });

  it('rejects a seat taken by a concurrent order', async () => {
    repository.reserveSeats.mockResolvedValue(false);
    const order = createOrder([
      { film: film.id, session: 'session-1', row: 1, seat: 2 },
    ]);

    await expectBadRequest(service.create(order));
  });

  it('rolls back an earlier reservation when another group fails', async () => {
    repository.reserveSeats
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const order = createOrder([
      { film: film.id, session: 'session-1', row: 1, seat: 2 },
      { film: film.id, session: 'session-2', row: 2, seat: 3 },
    ]);

    await expectBadRequest(service.create(order));
    expect(repository.releaseSeats).toHaveBeenCalledWith(film.id, 'session-1', [
      '1:2',
    ]);
  });
});

async function expectBadRequest(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
    throw new Error('Expected OrderService to reject');
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
  }
}

function createOrder(tickets: OrderDto['tickets']): OrderDto {
  return {
    email: 'test@example.com',
    phone: '+70000000000',
    tickets,
  };
}

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
        id: 'session-1',
        daytime: '2024-06-28T07:00:53.000Z',
        hall: '1',
        rows: 5,
        seats: 10,
        price: 350,
        taken: [],
      },
      {
        id: 'session-2',
        daytime: '2024-06-28T10:00:53.000Z',
        hall: '2',
        rows: 5,
        seats: 10,
        price: 400,
        taken: [],
      },
    ],
  };
}
