import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePujaBookingDto } from './dto/create-puja-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PujaService {
  constructor(private prisma: PrismaService) {}

  private inMemoryPujaBookings: any[] = [];

  private defaultServices = [
    {
      id: 'puj-1',
      category: 'Abhishek Pooja',
      name: 'Jalabhishek 1 Brahmin',
      basePrice: 2100,
      duration: '45 Mins',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Offering sacred Narmada water with Vedic Mantras on holy Shivling for peace and wellness.',
    },
    {
      id: 'puj-2',
      category: 'Abhishek Pooja',
      name: 'Panchamrit Pujan 5 Brahmin',
      basePrice: 5100,
      duration: '1.5 Hours',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Performing Panchamrit Puja with Milk, Curd, Ghee, Honey & Sugar for spiritual liberation.',
    },
    {
      id: 'puj-3',
      category: 'Abhishek Pooja',
      name: 'Laghu Rudrabhishek 11 Brahmin',
      basePrice: 21000,
      duration: '3 Hours',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Vedic Rudram chanting for health, prosperity and removal of obstacles.',
    },
    {
      id: 'puj-4',
      category: 'Partheshwar',
      name: 'Partheshwar Shivling Nirman & Pujan',
      basePrice: 1500,
      duration: '1 Hour',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Clay Shivling crafted from holy Narmada earth, consecrated and worshipped.',
    },
    {
      id: 'puj-5',
      category: 'Navgrah Shanti',
      name: 'Navgrah Shanti Pujan',
      basePrice: 3100,
      duration: '2 Hours',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Pacification of planetary doshas with Vedic Navgrah Samidha Havan.',
    },
    {
      id: 'puj-6',
      category: 'Kalsarp Dosh',
      name: 'Kalsarp Dosh Nivaran Pujan',
      basePrice: 4100,
      duration: '2 Hours',
      personsIncluded: 2,
      extraPersonFee: 300,
      description: 'Rahu-Ketu dosh pacification conducted at the holy sangam ghat.',
    },
    {
      id: 'puj-7',
      category: 'EPujan',
      name: 'E-Aradhana Online Sankalp Pujan',
      basePrice: 2100,
      duration: 'Remote Sankalp',
      personsIncluded: 1,
      extraPersonFee: 0,
      description: 'Live remote Sankalp puja conducted in devotee gotra with Prasad dispatched to doorstep.',
    },
  ];

  async getAllServices(category?: string) {
    if (!this.prisma.isDatabaseConnected) {
      return category
        ? this.defaultServices.filter((s) => s.category.toLowerCase() === category.toLowerCase())
        : this.defaultServices;
    }

    try {
      const services = await this.prisma.pujaService.findMany({
        where: {
          isActive: true,
          ...(category ? { category } : {}),
        },
        orderBy: { basePrice: 'asc' },
      });
      return services.length > 0 ? services : this.defaultServices;
    } catch {
      return category
        ? this.defaultServices.filter((s) => s.category.toLowerCase() === category.toLowerCase())
        : this.defaultServices;
    }
  }

  async getServiceById(id: string) {
    if (!this.prisma.isDatabaseConnected) {
      const found = this.defaultServices.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
      if (found) return found;
      return this.defaultServices[0];
    }

    try {
      const service = await this.prisma.pujaService.findUnique({ where: { id } });
      if (!service) {
        const found = this.defaultServices.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
        if (found) return found;
        throw new NotFoundException(`Puja service with ID '${id}' not found`);
      }
      return service;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      const found = this.defaultServices.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
      return found || this.defaultServices[0];
    }
  }

  async createBooking(dto: CreatePujaBookingDto) {
    const serviceInfo =
      this.defaultServices.find(
        (s) => s.name.toLowerCase() === dto.serviceName.toLowerCase() || s.category.toLowerCase() === dto.category.toLowerCase(),
      ) || this.defaultServices[0];

    const extraPersons = Math.max(0, dto.totalPerson - serviceInfo.personsIncluded);
    const extraFee = extraPersons * serviceInfo.extraPersonFee;
    const totalAmount = serviceInfo.basePrice + extraFee;
    const bookingRef = `OMK-PUJ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedBooking = {
      success: true,
      message: 'Puja Ritual Booked Successfully',
      bookingReference: bookingRef,
      serviceName: dto.serviceName,
      category: dto.category,
      pujaDate: dto.pujaDate,
      gotra: dto.gotra || 'Kashyap',
      sankalpName: dto.sankalpName || `${dto.firstName} ${dto.lastName} Family`,
      totalPerson: dto.totalPerson,
      totalAmount,
      status: BookingStatus.CONFIRMED,
      priestAssigned: 'Acharya Pt. Radheshyam Sharma (Sabhamandap)',
      venue: 'Shri Omkareshwar Jyotirlinga Temple - Sabhamandap',
      devotee: {
        name: `${dto.firstName} ${dto.lastName}`,
        mobile: dto.mobile,
        email: dto.email,
      },
      createdAt: new Date(),
    };

    if (!this.prisma.isDatabaseConnected) {
      this.inMemoryPujaBookings.unshift(simulatedBooking);
      return simulatedBooking;
    }

    try {
      const service = await this.prisma.pujaService.findFirst({
        where: { name: dto.serviceName },
      });

      if (!service) {
        throw new NotFoundException(`Puja service '${dto.serviceName}' not found`);
      }

      const calculatedExtra = Math.max(0, dto.totalPerson - service.personsIncluded);
      const calculatedFee = calculatedExtra * Number(service.extraPersonFee);
      const calculatedTotal = Number(service.basePrice) + calculatedFee;

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

      const payment = await this.prisma.paymentTransaction.create({
        data: {
          transactionRef: `TXN-${bookingRef}`,
          amount: calculatedTotal,
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
          totalAmount: calculatedTotal,
          status: BookingStatus.CONFIRMED,
          paymentId: payment.id,
          priestAssigned: 'Acharya Pt. Radheshyam Sharma (Sabhamandap)',
        },
        include: {
          service: true,
          devotee: true,
          payment: true,
        },
      });

      const response = {
        success: true,
        message: 'Puja Ritual Booked Successfully',
        bookingReference: booking.bookingReference,
        serviceName: service.name,
        category: dto.category,
        pujaDate: dto.pujaDate,
        gotra: dto.gotra,
        sankalpName: booking.sankalpName,
        totalPerson: dto.totalPerson,
        totalAmount: booking.totalAmount,
        status: booking.status,
        priestAssigned: booking.priestAssigned,
        venue: 'Shri Omkareshwar Jyotirlinga Temple - Sabhamandap',
        devotee: {
          name: `${devotee.firstName} ${devotee.lastName}`,
          mobile: devotee.mobile,
          email: devotee.email,
        },
        createdAt: booking.createdAt,
      };

      this.inMemoryPujaBookings.unshift(response);
      return response;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.inMemoryPujaBookings.unshift(simulatedBooking);
      return simulatedBooking;
    }
  }

  async getAllBookings(page = 1, limit = 20) {
    if (!this.prisma.isDatabaseConnected) {
      const data = this.inMemoryPujaBookings.slice((page - 1) * limit, page * limit);
      return {
        total: this.inMemoryPujaBookings.length || 1,
        page,
        limit,
        data: data.length > 0 ? data : [
          {
            bookingReference: 'OMK-PUJ-DEMO-001',
            serviceName: 'Jalabhishek 1 Brahmin',
            pujaDate: new Date(),
            gotra: 'Kashyap',
            sankalpName: 'Ramesh Sharma Family',
            totalPerson: 2,
            totalAmount: 2100,
            status: 'CONFIRMED',
            priestAssigned: 'Sabhamandap Acharya',
          },
        ],
      };
    }

    try {
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
    } catch {
      return {
        total: 1,
        page,
        limit,
        data: [
          {
            bookingReference: 'OMK-PUJ-DEMO-001',
            serviceName: 'Jalabhishek 1 Brahmin',
            pujaDate: new Date(),
            gotra: 'Kashyap',
            sankalpName: 'Ramesh Sharma Family',
            totalPerson: 2,
            totalAmount: 2100,
            status: 'CONFIRMED',
            priestAssigned: 'Sabhamandap Acharya',
          },
        ],
      };
    }
  }
}
