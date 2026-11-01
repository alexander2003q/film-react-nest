import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ScheduleDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';
import {
  CreateTicketDto,
  OrderDto,
  OrderResponseDto,
  OrderResultDto,
} from './dto/order.dto';

interface ReservationGroup {
  filmId: string;
  sessionId: string;
  seats: string[];
  tickets: CreateTicketDto[];
}

interface ValidatedReservationGroup extends ReservationGroup {
  session: ScheduleDto;
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(order: OrderDto): Promise<OrderResponseDto> {
    const groups = await this.validateGroups(this.groupTickets(order));

    const reservedGroups: ValidatedReservationGroup[] = [];

    try {
      for (const group of groups) {
        const reserved = await this.filmsRepository.reserveSeats(
          group.filmId,
          group.sessionId,
          group.seats,
        );

        if (!reserved) {
          throw this.badRequest('One or more seats are already taken');
        }

        reservedGroups.push(group);
      }
    } catch (error) {
      await Promise.allSettled(
        reservedGroups.map((group) =>
          this.filmsRepository.releaseSeats(
            group.filmId,
            group.sessionId,
            group.seats,
          ),
        ),
      );

      throw error;
    }

    const items = groups.flatMap((group) =>
      group.tickets.map((ticket) => this.toOrderResult(ticket, group.session)),
    );

    return {
      total: items.length,
      items,
    };
  }

  private groupTickets(order: OrderDto): ReservationGroup[] {
    if (!order || !Array.isArray(order.tickets) || order.tickets.length === 0) {
      throw this.badRequest('The order must contain at least one ticket');
    }

    const groups = new Map<string, ReservationGroup>();
    const requestedSeats = new Set<string>();

    for (const ticket of order.tickets) {
      if (!ticket?.film || !ticket.session) {
        throw this.badRequest('Film and session identifiers are required');
      }

      if (!Number.isInteger(ticket.row) || !Number.isInteger(ticket.seat)) {
        throw this.badRequest('Row and seat must be integers');
      }

      const seat = `${ticket.row}:${ticket.seat}`;
      const seatKey = `${ticket.film}:${ticket.session}:${seat}`;

      if (requestedSeats.has(seatKey)) {
        throw this.badRequest('The order contains duplicate seats');
      }

      requestedSeats.add(seatKey);

      const groupKey = `${ticket.film}:${ticket.session}`;
      const group = groups.get(groupKey) ?? {
        filmId: ticket.film,
        sessionId: ticket.session,
        seats: [],
        tickets: [],
      };

      group.seats.push(seat);
      group.tickets.push(ticket);
      groups.set(groupKey, group);
    }

    return [...groups.values()];
  }

  private async validateGroups(
    groups: ReservationGroup[],
  ): Promise<ValidatedReservationGroup[]> {
    const validatedGroups: ValidatedReservationGroup[] = [];

    for (const group of groups) {
      const film = await this.filmsRepository.findById(group.filmId);

      if (!film) {
        throw this.badRequest('Film not found');
      }

      const session = film.schedule.find((item) => item.id === group.sessionId);

      if (!session) {
        throw this.badRequest('Session not found');
      }

      for (const ticket of group.tickets) {
        if (
          ticket.row < 1 ||
          ticket.row > session.rows ||
          ticket.seat < 1 ||
          ticket.seat > session.seats
        ) {
          throw this.badRequest('The selected seat is outside the hall');
        }

        if (session.taken.includes(`${ticket.row}:${ticket.seat}`)) {
          throw this.badRequest('One or more seats are already taken');
        }
      }

      validatedGroups.push({ ...group, session });
    }

    return validatedGroups;
  }

  private toOrderResult(
    ticket: CreateTicketDto,
    session: ScheduleDto,
  ): OrderResultDto {
    return {
      id: randomUUID(),
      film: ticket.film,
      session: ticket.session,
      daytime: session.daytime,
      row: ticket.row,
      seat: ticket.seat,
      price: session.price,
    };
  }

  private badRequest(message: string): BadRequestException {
    return new BadRequestException({ error: message });
  }
}
