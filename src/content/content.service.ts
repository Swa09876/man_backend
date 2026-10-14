import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getNews() {
    try {
      return await this.prisma.newsAnnouncement.findMany({
        orderBy: { datePublished: 'desc' },
      });
    } catch {
      return [
        {
          id: 'news-1',
          title: 'Ayushman Vay Vandana Scheme Health Welfare Camp Held at Temple Trust',
          summary: 'Under the guidance of SDM Punasa and Managing Trustee Rao Pushpendra Singh, a specialized medical verification camp was conducted for all personnel.',
          content: 'The camp witnessed participation of over 250 beneficiaries who received health checkups and smart health cards ensuring comprehensive cashless healthcare coverage.',
          datePublished: new Date(),
        },
        {
          id: 'news-2',
          title: 'Temple Trust Reviews Arrangements to Improve Devotee Crowd Management',
          summary: 'A high-level review meeting was held at the Mandir Administrative Office with representatives from the Police Department, Nagar Parishad, and Priest Council.',
          content: 'Decisions taken include installation of additional misting water coolers in holding sheds, commissioning of new automated ticket verification turnstiles at the VIP Shighra gate, and deployment of 40 additional volunteer marshals.',
          datePublished: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 'news-3',
          title: 'Special Cleanliness Drive Organised at Gaumukh Ghat on Gandhi Jayanti',
          summary: 'Public representatives, local boat operators, and devotees joined temple sanitation teams for a 4-hour riverbed cleaning drive along Gaumukh and Koti Teerth ghats.',
          content: 'A collective pledge was administered to eliminate single-use plastics from Mandhata island and preserve the holy waters of Maa Narmada in pristine condition.',
          datePublished: new Date(Date.now() - 86400000 * 6),
        },
      ];
    }
  }

  async getSchedules() {
    return [
      {
        session: 'Mangala Aarti & Morning Darshan',
        startTime: '05:00 AM',
        endTime: '12:20 PM',
        description: 'Morning Abhishek and Darshan in Sabhamandap.',
      },
      {
        session: 'Madhyahna Bhog Aarti',
        startTime: '12:20 PM',
        endTime: '01:15 PM',
        description: 'Bhog offering to Bhagwan Shiva. Sanctum closed briefly for Bhog.',
      },
      {
        session: 'Afternoon Darshan',
        startTime: '01:15 PM',
        endTime: '04:00 PM',
        description: 'General darshan and Parikrama visits.',
      },
      {
        session: 'Sandhya Shringar & Aarti',
        startTime: '04:00 PM',
        endTime: '08:30 PM',
        description: 'Grand evening floral Shringar and Deepaarti.',
      },
      {
        session: 'Shayan Aarti',
        startTime: '08:30 PM',
        endTime: '09:00 PM',
        description: 'Night Chaupar and bed preparation ritual before temple doors close.',
      },
    ];
  }

  async getLiveDarshanInfo() {
    return {
      channelId: 'UCsIZ3yYwCW4316fPX3V-4lg',
      embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCsIZ3yYwCW4316fPX3V-4lg&autoplay=1',
      timings: [
        { session: 'Morning Session', startTime: '05:30 AM', endTime: '12:20 PM' },
        { session: 'Afternoon Session', startTime: '01:15 PM', endTime: '04:00 PM' },
        { session: 'Evening Session', startTime: '04:45 PM', endTime: '08:30 PM' },
      ],
      helpline: '8989998686',
    };
  }

  async getFaqs() {
    return [
      {
        question: 'What is the procedure for Shighra Darshan?',
        answer: 'Devotees can book Shighra Darshan tickets online for ₹300 per person. Tickets grant entry through the dedicated fast-track gate with minimal waiting time.',
      },
      {
        question: 'Are there any restrictions on touching the main Shivling?',
        answer: 'As per temple tradition and supreme sanctity guidelines, devotees are not permitted to touch the main Swayambhu Jyotirlinga. Abhishek is performed at the designated Abhishek Sthal by authorized temple priests.',
      },
      {
        question: 'How do I download or reprint an existing ticket?',
        answer: 'Visit the "Ticket Reprint" portal, enter your Booking/Transaction Reference ID and registered Mobile number to instantly generate your printable ticket with gate entry QR code.',
      },
      {
        question: 'How can I claim an 80G tax exemption receipt for my donation?',
        answer: 'All donations made with a valid PAN number are automatically eligible for 80G tax exemptions under the Income Tax Act. For offline bank deposits or UPI, submit the 80G claim form with your UTR reference.',
      },
      {
        question: 'How long does Laddu Mahaprasad take to deliver?',
        answer: 'Orders are packed in sanitized conditions at Omkar Prasadalaya and dispatched through India Post Speed Post within 24 to 48 hours. Devotees receive tracking numbers to monitor real-time delivery.',
      },
    ];
  }

  async getTrustAdministration() {
    return {
      patron: 'District Collector & District Magistrate, Khandwa (M.P.)',
      managingTrustee: 'Shri Rao Pushpendra Singh Chauhan',
      chiefExecutiveOfficer: 'Sub-Divisional Magistrate (SDM), Omkareshwar - Shri Pankaj Verma',
      address: 'Office of Shri Omkareshwar Mandir Trust, Mandhata, Omkareshwar, MP',
      helpline: '8989998686',
    };
  }
}
