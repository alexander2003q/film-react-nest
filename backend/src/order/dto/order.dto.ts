import { ListResponseDto } from '../../common/dto/list-response.dto';

export class TicketPlaceDto {
  film: string;
  session: string;
  row: number;
  seat: number;
}

export class CreateTicketDto extends TicketPlaceDto {
  daytime?: string;
  price?: number;
}

export class TicketDto extends TicketPlaceDto {
  daytime: string;
  price: number;
}

export class OrderDto {
  email: string;
  phone: string;
  tickets: CreateTicketDto[];
}

export class OrderResultDto extends TicketDto {
  id: string;
}

export class OrderResponseDto extends ListResponseDto<OrderResultDto> {}
