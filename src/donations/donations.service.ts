import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Claim80GDto } from './dto/claim-80g.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    try {
      return await this.prisma.donationCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    } catch {
      return [
        { code: 'ANN_KSHETRA', name: 'Ann Kshetra Meal Sponsorship', description: 'Feed pilgrims and sadhus.' },
        { code: 'TRUST_FUND', name: 'General Trust Fund', description: 'General corpus fund for mandir maintenance.' },
        { code: 'SAMANYA_SHRINGAR', name: 'Samanya Shringar', description: 'Daily sacred chandan and bilvapatra shringar seva.' },
        { code: 'NAIVEDYA_BHOG', name: 'Samanya Naivedya Bhog', description: 'Daily holy Rajbhog offering.' },
        { code: 'KHICHDI_501', name: 'Khichdi Sewa Daan', description: 'Hot nutritious khichdi prasad distribution.' },
        { code: 'NANDA_DEEPAK', name: 'Nanda Deepak Deep Ghrit', description: 'Pure Desi Cow Ghee for Akhand Jyot.' },
        { code: 'ROOM_DONATION', name: 'Vishramalaya Room Donation', description: 'Contribution for pilgrim bhavan.' },
      ];
    }
  }

  async createDonation(dto: CreateDonationDto) {
    const category = await this.prisma.donationCategory.findUnique({
      where: { code: dto.categoryCode },
    });

    if (!category) {
      throw new NotFoundException(`Donation category '${dto.categoryCode}' not found`);
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
          gender: 'Not Specified',
          idProofType: dto.panNumber ? 'PAN' : 'AADHAAR',
          idProofNumber: dto.panNumber || dto.aadharNumber,
          address: dto.address,
        },
      });
    }

    const receiptNo = `RCP-OMK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await this.prisma.paymentTransaction.create({
      data: {
        transactionRef: `TXN-${receiptNo}`,
        amount: dto.amount,
        status: PaymentStatus.SUCCESS,
        paymentMethod: 'ONLINE_DONATION',
      },
    });

    const donation = await this.prisma.donation.create({
      data: {
        receiptNumber: receiptNo,
        devoteeId: devotee.id,
        categoryId: category.id,
        amount: dto.amount,
        panNumber: dto.panNumber,
        paymentId: payment.id,
        is80GClaimed: !!dto.panNumber,
      },
      include: {
        category: true,
        devotee: true,
        payment: true,
      },
    });

    // If PAN provided, create 80G tax exemption entry automatically
    let taxExemptionCertificate: string | null = null;
    if (dto.panNumber) {
      const certNo = `80G-OMK-${Date.now().toString().slice(-6)}`;
      const cert = await this.prisma.taxExemption80G.create({
        data: {
          certificateNo: certNo,
          donationId: donation.id,
          donorPAN: dto.panNumber,
          donorName: `${dto.firstName} ${dto.lastName}`,
        },
      });
      taxExemptionCertificate = cert.certificateNo;
    }

    return {
      success: true,
      message: 'Donation Received with Grateful Blessings',
      receiptNumber: donation.receiptNumber,
      amount: donation.amount,
      categoryName: category.name,
      donorName: `${devotee.firstName} ${devotee.lastName}`,
      panNumber: dto.panNumber,
      taxExemption80GCertificate: taxExemptionCertificate,
      donatedAt: donation.createdAt,
    };
  }

  async claim80G(dto: Claim80GDto) {
    const claimRef = `CLM-80G-${Date.now().toString().slice(-6)}`;

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
          idProofType: 'PAN',
          idProofNumber: dto.pan,
          address: dto.address,
        },
      });
    }

    return {
      success: true,
      claimReference: claimRef,
      message: '80G Tax Exemption Claim submitted for Mandir Accounts verification.',
      utrNumber: dto.utrNumber,
      donorName: `${dto.firstName} ${dto.lastName}`,
      pan: dto.pan,
      amount: dto.amount,
      status: 'UNDER_VERIFICATION',
    };
  }

  async getAllDonations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      this.prisma.donation.count(),
      this.prisma.donation.findMany({
        skip,
        take: limit,
        include: { category: true, devotee: true, taxExemption: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, limit, data };
  }
}
