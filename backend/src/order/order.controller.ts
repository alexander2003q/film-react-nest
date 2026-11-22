import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateTicketDto, OrderDto, OrderResponseDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(
    @Body() order: OrderDto | CreateTicketDto[],
  ): Promise<OrderResponseDto> {
    return this.orderService.create(order);
  }
}
