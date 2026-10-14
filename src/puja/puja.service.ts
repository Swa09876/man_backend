import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePujaBookingDto } from './dto/create-puja-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PujaService {
  constructor(private prisma: PrismaService) {}

  async getAllServices(category?: string) {
    try {
      return await this.prisma.pujaService.findMany({
        where: {
          isActive: true,
          ...(category ? { category } : {}),
        },
        orderBy: { basePrice: 'asc' },
      });
    } catch {
      const fallback = [
        { id: '1', category: 'Abhishek Pooja', name: 'Jalabhishek 1 Brahmin', basePrice: 2100, duration: '45 Mins' },
        { id: '2', category: 'Abhishek Pooja', name: 'Panchamrit Pujan 5 Brahmin', basePrice: 5100, duration: '1.5 Hours' },
        { id: '3', category: 'Abhishek Pooja', name: 'Laghu Rudrabhishek 11 Brahmin', basePrice: 21000, duration: '3 Hours' },
        { id: '4', category: 'Partheshwar', name: 'Partheshwar Shivling Nirman & Pujan', basePrice: 1500, duration: '1 Hour' },
        { id: '5', category: 'Navgrah Shanti', name: 'Navgrah Shanti Pujan', basePrice: 3100, duration: '2 Hours' },
        { id: '6', category: 'Kalsarp Dosh', name: 'Kalsarp Dosh Nivaran Pujan', basePrice: 4100, duration: '2 Hours' },
      ];
      return category ? fallback.filter((f) => f.category === category) : fallback;
    }
  }

  async getServiceById(id: string) {
    const service = await this.prisma.pujaService.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Puja service with ID '${id}' not found`);
    }
    return service;
  }

  async createBooking(dto: CreatePujaBookingDto) {
    const service = await this.prisma.pujaService.findFirst({
      where: { name: dto.serviceName },
    });

    if (!service) {
      throw new NotFoundException(`Puja service '${dto.serviceName}' not found`);
    }

    const extraPersons = Math.max(0, dto.totalPerson - service.personsIncluded);
    const extraFee = extraPersons * Number(service.extraPersonFee);
    const totalAmount = Number(service.basePrice) + extraFee;

    // Upsert devotee
    let devotee = await this.prisma.devotee.findFirst({
      where: { mobile: dto.mobile },
    });

    if (!devotee) {
      devotee = await this.prisma.devotee.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          mobile: dto.mobile,
          email: dto.email,
          gender: dto.gender,
          idProofNumber: dto.idProofNumber,
          address: dto.address,
        },
      });
    }

    const bookingRef = `OMK-PUJ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await this.prisma.paymentTransaction.create({
      data: {
        transactionRef: `TXN-${bookingRef}`,
        amount: totalAmount,
        status: PaymentStatus.SUCCESS,
        paymentMethod: 'ONLINE_PORTAL',
      },
    });

    const booking = await this.prisma.pujaBooking.create({
      data: {
        bookingReference: bookingRef,
        devoteeId: devotee.id,
        serviceId: service.id,
        pujaDate: new Date(dto.pujaDate),
        gotra: dto.gotra,
        sankalpName: dto.sankalpName || `${dto.firstName} ${dto.lastName}`,
        totalPerson: dto.totalPerson,
        totalAmount,
        status: BookingStatus.CONFIRMED,
        paymentId: payment.id,
        priestAssigned: 'Assigned at Sabhamandap',
      },
      include: {
        service: true,
        devotee: true,
        payment: true,
      },
    });

    return {
      success: true,
      message: 'Puja Ritual Booked Successfully',
      bookingReference: booking.bookingReference,
      serviceName: service.name,
      pujaDate: dto.pujaDate,
      gotra: dto.gotra,
      sankalpName: booking.sankalpName,
      totalAmount: booking.totalAmount,
      status: booking.status,
      devotee: {
        name: `${devotee.firstName} ${devotee.lastName}`,
        mobile: devotee.mobile,
      },
    };
  }

  async getAllBookings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.pujaBooking.count(),
      this.prisma.pujaBooking.findMany({
        skip,
        take: limit,
        include: { service: true, devotee: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, data };
  }
}
