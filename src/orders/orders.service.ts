import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getProducts() {
    try {
      return await this.prisma.product.findMany({
        include: { variants: true },
      });
    } catch {
      return [
        {
          id: 'prod-1',
          name: 'Laddu Mahaprasad',
          description: 'Pure Desi Ghee Besan Laddu Mahaprasad prepared under strict hygiene in temple Prasadalaya.',
          variants: [
            { id: 'v-250', weight: '250g', price: 120, stockQty: 1000 },
            { id: 'v-500', weight: '500g', price: 240, stockQty: 1000 },
            { id: 'v-1000', weight: '1kg', price: 480, stockQty: 1000 },
          ],
        },
      ];
    }
  }

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one product.');
    }

    // Resolve variants and calculate subtotal
    let subtotal = 0;
    const resolvedItems: { variantId: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];

    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { weight: item.weight },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant weight '${item.weight}' not found`);
      }

      const itemTotal = Number(variant.price) * item.quantity;
      subtotal += itemTotal;
      resolvedItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: Number(variant.price),
        totalPrice: itemTotal,
      });
    }

    const shippingCharge = 60.0; // Standard Speed Post flat rate
    const totalAmount = subtotal + shippingCharge;

    // Upsert devotee
    let devotee = await this.prisma.devotee.findFirst({
      where: { mobile: dto.mobile },
    });

    if (!devotee) {
      const names = dto.recipientName.split(' ');
      devotee = await this.prisma.devotee.create({
        data: {
          firstName: names[0] || 'Devotee',
          lastName: names.slice(1).join(' ') || 'Customer',
          mobile: dto.mobile,
          email: dto.email,
          gender: 'Not Specified',
          address: dto.addressLine1,
          city: dto.city,
          state: dto.state,
          pinCode: dto.pinCode,
        },
      });
    }

    const orderNo = `OMK-PRD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNo = `EM${Math.floor(10000000 + Math.random() * 90000000)}IN`;

    const payment = await this.prisma.paymentTransaction.create({
      data: {
        transactionRef: `TXN-${orderNo}`,
        amount: totalAmount,
        status: PaymentStatus.SUCCESS,
        paymentMethod: 'ONLINE_STORE',
      },
    });

    const order = await this.prisma.order.create({
      data: {
        orderNumber: orderNo,
        trackingId: trackingNo,
        devoteeId: devotee.id,
        status: OrderStatus.PLACED,
        itemsSubtotal: subtotal,
        shippingCharge,
        totalAmount,
        paymentId: payment.id,
        items: {
          create: resolvedItems.map((r) => ({
            variantId: r.variantId,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            totalPrice: r.totalPrice,
          })),
        },
        address: {
          create: {
            recipientName: dto.recipientName,
            mobile: dto.mobile,
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2,
            landmark: dto.landmark,
            city: dto.city,
            state: dto.state,
            pinCode: dto.pinCode,
          },
        },
      },
      include: {
        items: { include: { variant: true } },
        address: true,
        payment: true,
      },
    });

    return {
      success: true,
      message: 'Mahaprasad Order placed successfully!',
      orderNumber: order.orderNumber,
      trackingId: order.trackingId,
      itemsSubtotal: order.itemsSubtotal,
      shippingCharge: order.shippingCharge,
      totalAmount: order.totalAmount,
      status: order.status,
      address: order.address,
    };
  }

  async trackOrder(query: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ trackingId: query }, { orderNumber: query }],
      },
      include: {
        items: { include: { variant: true } },
        address: true,
        devotee: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`No order found with Tracking ID or Order Number '${query}'.`);
    }

    return order;
  }

  async getAllOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: { items: { include: { variant: true } }, address: true, devotee: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, data };
  }
}
