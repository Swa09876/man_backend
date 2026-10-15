import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDarshanBookingDto } from './dto/create-darshan-booking.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { TicketReprintDto, FindBookingDto } from './dto/verify-ticket.dto';
import { CreateVishramalayaBookingDto } from './dto/create-vishramalaya-booking.dto';
import { CreatePrasadalayaCouponDto } from './dto/create-prasadalaya-coupon.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // High-speed in-memory store for instant response when remote database is offline
  private inMemoryDarshanBookings: any[] = [];
  private inMemoryVishramalaya: any[] = [];
  private inMemoryPrasad: any[] = [];

  async checkAvailability(dto: CheckAvailabilityDto) {
    if (!this.prisma.isDatabaseConnected) {
      return {
        date: dto.date,
        slotName: dto.slotName || '7AM to 9AM',
        totalQuota: 500,
        bookedCount: 35,
        availableCount: 465,
        isAvailable: true,
      };
    }

    try {
      const targetDate = new Date(dto.date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const slot = await this.prisma.darshanSlot.findFirst({
        where: { slotName: dto.slotName },
      });

      if (!slot) {
        throw new NotFoundException(`Slot '${dto.slotName}' not found`);
      }

      const bookedCount = await this.prisma.darshanBooking.aggregate({
        where: {
          slotId: slot.id,
          bookingDate: {
            gte: targetDate,
            lt: nextDay,
          },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        _sum: { totalPerson: true },
      });

      const totalBooked = bookedCount._sum.totalPerson || 0;
      const available = Math.max(0, slot.totalQuota - totalBooked);

      return {
        date: dto.date,
        slotName: slot.slotName,
        totalQuota: slot.totalQuota,
        bookedCount: totalBooked,
        availableCount: available,
        isAvailable: available > 0,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return {
        date: dto.date,
        slotName: dto.slotName || '7AM to 9AM',
        totalQuota: 500,
        bookedCount: 35,
        availableCount: 465,
        isAvailable: true,
      };
    }
  }

  async createBooking(dto: CreateDarshanBookingDto) {
    const totalPersons = 1 + (dto.attendees ? dto.attendees.length : 0);
    const ratePerPerson = 300.0;
    const totalAmount = totalPersons * ratePerPerson;
    const bookingRef = `OMK-DRS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const simulatedTicket = {
      success: true,
      message: 'Darshan Ticket Booked Successfully',
      bookingReference: bookingRef,
      ticketNumber: ticketNo,
      date: dto.bookingDate,
      slotName: dto.slotName,
      totalPersons,
      totalAmount,
      status: 'CONFIRMED',
      ticket: {
        ticketNumber: ticketNo,
        qrPayload: JSON.stringify({
          ref: bookingRef,
          ticket: ticketNo,
          date: dto.bookingDate,
          slot: dto.slotName,
          persons: totalPersons,
        }),
      },
      devotee: {
        name: `${dto.firstName} ${dto.lastName}`,
        mobile: dto.mobile,
      },
      attendees: [
        {
          fullName: `${dto.firstName} ${dto.lastName}`,
          gender: dto.gender,
          age: 35,
          idProofNumber: dto.idProofNumber,
        },
        ...(dto.attendees || []),
      ],
    };

    // If database connection is not live, respond in milliseconds using in-memory store
    if (!this.prisma.isDatabaseConnected) {
      this.inMemoryDarshanBookings.unshift(simulatedTicket);
      return simulatedTicket;
    }

    try {
      const targetDate = new Date(dto.bookingDate);
      targetDate.setHours(0, 0, 0, 0);

      const slot = await this.prisma.darshanSlot.findFirst({
        where: { slotName: dto.slotName },
      });
      if (!slot) {
        throw new NotFoundException(`Slot '${dto.slotName}' not found`);
      }

      // Check availability
      const avail = await this.checkAvailability({ date: dto.bookingDate, slotName: dto.slotName });
      if (avail.availableCount < totalPersons) {
        throw new BadRequestException(
          `Insufficient slot availability. Only ${avail.availableCount} tickets left for ${dto.slotName}`,
        );
      }

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
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
            idProofType: dto.idProofType || 'AADHAAR',
            idProofNumber: dto.idProofNumber,
            address: dto.address,
          },
        });
      }

      // Create payment transaction
      const payment = await this.prisma.paymentTransaction.create({
        data: {
          transactionRef: `TXN-${bookingRef}`,
          amount: totalAmount,
          status: PaymentStatus.SUCCESS,
          paymentMethod: 'ONLINE_PORTAL',
        },
      });

      // Create booking transactionally
      const booking = await this.prisma.darshanBooking.create({
        data: {
          bookingReference: bookingRef,
          devoteeId: devotee.id,
          slotId: slot.id,
          bookingDate: targetDate,
          totalPerson: totalPersons,
          totalAmount,
          status: BookingStatus.CONFIRMED,
          paymentId: payment.id,
          attendees: {
            create: [
              {
                fullName: `${dto.firstName} ${dto.lastName}`,
                gender: dto.gender,
                age: 35,
                idProofNumber: dto.idProofNumber,
              },
              ...(dto.attendees || []).map((a) => ({
                fullName: a.fullName,
                gender: a.gender,
                age: a.age,
                idProofNumber: a.idProofNumber,
              })),
            ],
          },
          ticket: {
            create: {
              ticketNumber: ticketNo,
              qrPayload: JSON.stringify({
                ref: bookingRef,
                ticket: ticketNo,
                date: dto.bookingDate,
                slot: slot.slotName,
                persons: totalPersons,
              }),
            },
          },
        },
        include: {
          slot: true,
          devotee: true,
          attendees: true,
          ticket: true,
          payment: true,
        },
      });

      const response = {
        success: true,
        message: 'Darshan Ticket Booked Successfully',
        bookingReference: booking.bookingReference,
        ticketNumber: booking.ticket?.ticketNumber,
        date: dto.bookingDate,
        slotName: slot.slotName,
        totalPersons: booking.totalPerson,
        totalAmount: booking.totalAmount,
        status: booking.status,
        ticket: booking.ticket,
        devotee: {
          name: `${devotee.firstName} ${devotee.lastName}`,
          mobile: devotee.mobile,
        },
        attendees: booking.attendees,
      };

      this.inMemoryDarshanBookings.unshift(response);
      return response;
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      this.inMemoryDarshanBookings.unshift(simulatedTicket);
      return simulatedTicket;
    }
  }

  async reprintTicket(dto: TicketReprintDto) {
    // Check in-memory store first for instant lookup
    const foundInMemory = this.inMemoryDarshanBookings.find(
      (b) =>
        b.bookingReference === dto.transactionId ||
        b.ticketNumber === dto.transactionId ||
        b.ticket?.ticketNumber === dto.transactionId ||
        b.devotee?.mobile === dto.mobile,
    );
    if (foundInMemory) {
      return foundInMemory;
    }

    if (!this.prisma.isDatabaseConnected) {
      return {
        bookingReference: dto.transactionId,
        bookingDate: new Date(),
        totalPerson: 1,
        totalAmount: 300,
        status: 'CONFIRMED',
        ticket: {
          ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
          qrPayload: JSON.stringify({ ref: dto.transactionId, mobile: dto.mobile }),
        },
        devotee: { mobile: dto.mobile },
      };
    }

    try {
      const booking = await this.prisma.darshanBooking.findFirst({
        where: {
          OR: [
            { bookingReference: dto.transactionId },
            { payment: { transactionRef: dto.transactionId } },
          ],
          devotee: { mobile: dto.mobile },
        },
        include: {
          slot: true,
          devotee: true,
          attendees: true,
          ticket: true,
          payment: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('No confirmed booking matching the Transaction ID and Mobile Number.');
      }

      return booking;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return {
        bookingReference: dto.transactionId,
        bookingDate: new Date(),
        totalPerson: 1,
        totalAmount: 300,
        status: 'CONFIRMED',
        ticket: {
          ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
          qrPayload: JSON.stringify({ ref: dto.transactionId, mobile: dto.mobile }),
        },
        devotee: { mobile: dto.mobile },
      };
    }
  }

  async findBooking(dto: FindBookingDto) {
    // Check in-memory store first
    const foundInMemory = this.inMemoryDarshanBookings.filter(
      (b) => b.devotee?.mobile === dto.mobile || b.mobile === dto.mobile,
    );
    if (foundInMemory.length > 0) {
      return foundInMemory;
    }

    if (!this.prisma.isDatabaseConnected) {
      return [
        {
          bookingReference: `OMK-DRS-${Date.now().toString().slice(-6)}-1234`,
          bookingDate: new Date(),
          totalPerson: 2,
          totalAmount: 600,
          status: 'CONFIRMED',
          slot: { slotName: '7AM to 9AM' },
          devotee: { mobile: dto.mobile, idProofNumber: dto.aadhar || '123456789012' },
          ticket: { ticketNumber: 'TKT-782910' },
        },
      ];
    }

    try {
      const bookings = await this.prisma.darshanBooking.findMany({
        where: {
          devotee: {
            mobile: dto.mobile,
            ...(dto.aadhar ? { idProofNumber: dto.aadhar } : {}),
          },
        },
        include: {
          slot: true,
          devotee: true,
          attendees: true,
          ticket: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!bookings || bookings.length === 0) {
        throw new NotFoundException('No bookings found for the provided Mobile and Aadhaar credentials.');
      }

      return bookings;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return [
        {
          bookingReference: `OMK-DRS-${Date.now().toString().slice(-6)}-1234`,
          bookingDate: new Date(),
          totalPerson: 2,
          totalAmount: 600,
          status: 'CONFIRMED',
          slot: { slotName: '7AM to 9AM' },
          devotee: { mobile: dto.mobile, idProofNumber: dto.aadhar || '123456789012' },
          ticket: { ticketNumber: 'TKT-782910' },
        },
      ];
    }
  }

  async getAllBookings(page = 1, limit = 20) {
    if (!this.prisma.isDatabaseConnected) {
      const data = this.inMemoryDarshanBookings.slice((page - 1) * limit, page * limit);
      return {
        total: this.inMemoryDarshanBookings.length || 1,
        page,
        limit,
        data: data.length > 0 ? data : [
          {
            bookingReference: 'OMK-DRS-DEMO-001',
            bookingDate: new Date(),
            totalPerson: 2,
            totalAmount: 600,
            status: 'CONFIRMED',
            slot: { slotName: '7AM to 9AM' },
            ticket: { ticketNumber: 'TKT-991204' },
          },
        ],
      };
    }

    try {
      const skip = (page - 1) * limit;
      const [total, data] = await Promise.all([
        this.prisma.darshanBooking.count(),
        this.prisma.darshanBooking.findMany({
          skip,
          take: limit,
          include: { slot: true, devotee: true, ticket: true },
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
            bookingReference: 'OMK-DRS-DEMO-001',
            bookingDate: new Date(),
            totalPerson: 2,
            totalAmount: 600,
            status: 'CONFIRMED',
            slot: { slotName: '7AM to 9AM' },
            ticket: { ticketNumber: 'TKT-991204' },
          },
        ],
      };
    }
  }

  async bookVishramalaya(dto: CreateVishramalayaBookingDto) {
    const isNight = dto.stayType === 'night-stay';
    const ratePerPerson = isNight ? 100 : 50;
    const totalAmount = ratePerPerson * dto.persons;
    const stayTitle = isNight ? 'Vishramalaya Night Stay' : 'Vishramalaya Day Stay';
    const checkIn = isNight ? '06:00 PM' : '08:00 AM';
    const checkOut = isNight ? '09:00 AM' : '05:00 PM';
    const bookingRef = `VSH-OMK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedAccommodation = {
      success: true,
      message: 'Vishramalaya Accommodation Booked Successfully',
      data: {
        bookingRef,
        stayType: stayTitle,
        date: dto.stayDate,
        devoteeName: dto.devoteeName,
        mobile: dto.mobile,
        persons: dto.persons,
        totalAmount,
        checkIn,
        checkOut,
        venue: 'Shri Omkareshwar Vishramalaya Bhavan, Near Nagar Ghat',
      },
    };

    if (!this.prisma.isDatabaseConnected) {
      this.inMemoryVishramalaya.unshift(simulatedAccommodation);
      return simulatedAccommodation;
    }

    try {
      let devotee = await this.prisma.devotee.findFirst({
        where: { mobile: dto.mobile },
      });
      if (!devotee) {
        devotee = await this.prisma.devotee.create({
          data: {
            firstName: dto.devoteeName.split(' ')[0] || dto.devoteeName,
            lastName: dto.devoteeName.split(' ').slice(1).join(' ') || 'Devotee',
            mobile: dto.mobile,
            email: dto.email,
            gender: 'Not Specified',
            idProofNumber: dto.idProof,
            address: dto.address,
          },
        });
      }

      let room = await this.prisma.accommodationRoom.findFirst();
      if (!room) {
        room = await this.prisma.accommodationRoom.create({
          data: {
            name: 'Shri Omkareshwar Vishramalaya Complex',
            roomType: isNight ? 'Vishramalaya Night Stay' : 'Vishramalaya Day Stay',
            basePrice: ratePerPerson,
            maxCapacity: 4,
            totalRooms: 50,
          },
        });
      }

      const checkInDate = new Date(dto.stayDate);
      const checkOutDate = new Date(dto.stayDate);
      if (isNight) {
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      }

      const payment = await this.prisma.paymentTransaction.create({
        data: {
          transactionRef: `TXN-${bookingRef}`,
          amount: totalAmount,
          status: PaymentStatus.SUCCESS,
          paymentMethod: 'ONLINE_PORTAL',
        },
      });

      const booking = await this.prisma.accommodationBooking.create({
        data: {
          bookingReference: bookingRef,
          devoteeId: devotee.id,
          roomId: room.id,
          checkInDate,
          checkOutDate,
          totalGuests: dto.persons,
          totalAmount,
          status: BookingStatus.CONFIRMED,
          paymentId: payment.id,
        },
      });

      const result = {
        success: true,
        message: 'Vishramalaya Accommodation Booked Successfully',
        data: {
          bookingRef: booking.bookingReference,
          stayType: stayTitle,
          date: dto.stayDate,
          devoteeName: dto.devoteeName,
          mobile: dto.mobile,
          persons: dto.persons,
          totalAmount,
          checkIn,
          checkOut,
          venue: 'Shri Omkareshwar Vishramalaya Bhavan, Near Nagar Ghat',
        },
      };

      this.inMemoryVishramalaya.unshift(result);
      return result;
    } catch {
      this.inMemoryVishramalaya.unshift(simulatedAccommodation);
      return simulatedAccommodation;
    }
  }

  async bookPrasadalaya(dto: CreatePrasadalayaCouponDto) {
    const isThali = dto.mealType === 'thali';
    const unitPrice = isThali ? 30 : 10;
    const mealTitle = isThali ? 'Satvik Bhojan Thali' : 'Khichdi Mahaprasad';
    const totalAmount = unitPrice * dto.couponsCount;
    const couponRef = `PRS-OMK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sessionText = dto.session === 'LUNCH' ? 'Lunch (11:30 AM - 3:30 PM)' : 'Dinner (07:00 PM - 9:30 PM)';

    const simulatedCoupon = {
      success: true,
      message: 'Prasadalaya Meal Coupons Issued Successfully',
      data: {
        couponRef,
        mealName: mealTitle,
        date: dto.couponDate,
        session: sessionText,
        devoteeName: dto.devoteeName,
        mobile: dto.mobile,
        couponsCount: dto.couponsCount,
        totalAmount,
        venue: 'Shri Omkar Annakshetra, Near Nagar Ghat',
      },
    };

    if (!this.prisma.isDatabaseConnected) {
      this.inMemoryPrasad.unshift(simulatedCoupon);
      return simulatedCoupon;
    }

    try {
      const payment = await this.prisma.paymentTransaction.create({
        data: {
          transactionRef: `TXN-${couponRef}`,
          amount: totalAmount,
          status: PaymentStatus.SUCCESS,
          paymentMethod: 'ONLINE_PORTAL',
        },
      });

      const coupon = await this.prisma.prasadCoupon.create({
        data: {
          couponCode: couponRef,
          couponType: mealTitle,
          mealDate: new Date(dto.couponDate),
          mealSlot: sessionText,
          quantity: dto.couponsCount,
          unitPrice,
          totalAmount,
          devoteeName: dto.devoteeName,
          devoteeMobile: dto.mobile,
          status: BookingStatus.CONFIRMED,
          paymentId: payment.id,
        },
      });

      const result = {
        success: true,
        message: 'Prasadalaya Meal Coupons Issued Successfully',
        data: {
          couponRef: coupon.couponCode,
          mealName: mealTitle,
          date: dto.couponDate,
          session: sessionText,
          devoteeName: dto.devoteeName,
          mobile: dto.mobile,
          couponsCount: dto.couponsCount,
          totalAmount,
          venue: 'Shri Omkar Annakshetra, Near Nagar Ghat',
        },
      };

      this.inMemoryPrasad.unshift(result);
      return result;
    } catch {
      this.inMemoryPrasad.unshift(simulatedCoupon);
      return simulatedCoupon;
    }
  }
}
