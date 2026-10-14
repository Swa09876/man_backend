import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Mahaprasad Store')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('products')
  @ApiOperation({ summary: 'List all Mahaprasad products and package variants' })
  async getProducts() {
    return this.ordersService.getProducts();
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place Laddu Mahaprasad online order' })
  @ApiResponse({ status: 201, description: 'Order created with India Post tracking number.' })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('track')
  @ApiOperation({ summary: 'Track order shipment by Tracking ID or Order Number' })
  async trackOrder(@Query('trackingId') trackingId: string) {
    return this.ordersService.trackOrder(trackingId);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all orders (Admin/Prasad Distribution)' })
  async getAllOrders(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.ordersService.getAllOrders(parseInt(page, 10), parseInt(limit, 10));
  }
}
