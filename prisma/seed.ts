import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Shri Omkareshwar Temple database...');

  // 1. Super Admin User
  const adminPasswordHash = await bcrypt.hash('Omkar@2026!', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@shriomkareshwar.org' },
    update: {},
    create: {
      email: 'admin@shriomkareshwar.org',
      fullName: 'Chief Executive Officer, Mandir Trust',
      passwordHash: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // 2. Darshan Slots
  const slots = [
    { slotName: '7AM to 9AM', startTime: '07:00', endTime: '09:00', totalQuota: 500 },
    { slotName: '10AM to 12PM', startTime: '10:00', endTime: '12:00', totalQuota: 500 },
    { slotName: '2PM to 4PM', startTime: '14:00', endTime: '16:00', totalQuota: 500 },
    { slotName: '6PM to 8PM', startTime: '18:00', endTime: '20:00', totalQuota: 500 },
  ];

  for (const s of slots) {
    const existing = await prisma.darshanSlot.findFirst({ where: { slotName: s.slotName } });
    if (!existing) {
      await prisma.darshanSlot.create({ data: s });
    }
  }

  // 3. Puja Services
  const pujaServices = [
    {
      category: 'Abhishek Pooja',
      name: 'Jalabhishek 1 Brahmin',
      duration: '30 Min',
      basePrice: 2100.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Offering holy Narmada water with Vedic Mantras on the sacred Shivling brings peace and well-being.',
    },
    {
      category: 'Abhishek Pooja',
      name: 'Panchamrit Pujan 5 Brahmin',
      duration: '1.5 Hour',
      basePrice: 5100.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Performing Panchamrit Puja with Milk, Curd, Ghee, Honey & Sugar brings prosperity and spiritual liberation.',
    },
    {
      category: 'Abhishek Pooja',
      name: 'Laghu Rudrabhishek 11 Brahmin',
      duration: '3 Hours',
      basePrice: 21000.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Laghu Rudrabhishek is chanted for material well-being, health and removal of severe obstacles.',
    },
    {
      category: 'Abhishek Pooja',
      name: 'Maha Rudrabhishek 11 Brahmins',
      duration: '3 Days / 7 Hours',
      basePrice: 300000.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'The supreme ritual dedicated to Mahadev performed over 3 auspicious days.',
    },
    {
      category: 'Partheshwar',
      name: 'Partheshwar Shivling Nirman & Pujan',
      duration: '1 Hour',
      basePrice: 1500.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Sacred clay Shivling crafted from holy Narmada clay, worshipped with Abhishek and immersed.',
    },
    {
      category: 'Navgrah Shanti',
      name: 'Navgrah Shanti Pujan',
      duration: '2 Hours',
      basePrice: 3100.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Pacification of planetary doshas with Vedic Navgrah Samidha Havan.',
    },
    {
      category: 'Kalsarp Dosh',
      name: 'Kalsarp Dosh Nivaran Pujan',
      duration: '2 Hours',
      basePrice: 4100.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Rahu-Ketu and Nagbali dosh pacification conducted at the sangam ghat.',
    },
    {
      category: 'Narmada',
      name: 'Maa Narmada Sayamkalin Aarti Pujan',
      duration: '45 Min',
      basePrice: 1100.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Evening Deepdaan and Chunari manorath offering to Maa Narmada.',
    },
    {
      category: 'Mahamrityunjaya Jaap',
      name: 'Maha Mrityunjaya Anushthan (1.25 Lakh)',
      duration: '7 Days',
      basePrice: 51000.0,
      personsIncluded: 2,
      extraPersonFee: 300.0,
      description: 'Vedic Sanjeevani chant for health, recovery and longevity performed by 5 learned Brahmins.',
    },
    {
      category: 'Somwar Sawari',
      name: 'Somwar Sawari Palki Seva',
      duration: 'Evening Procession',
      basePrice: 11000.0,
      personsIncluded: 4,
      extraPersonFee: 500.0,
      description: 'Special Palki seva offering during holy Monday procession of Bhagwan Omkareshwar.',
    },
    {
      category: 'EPujan',
      name: 'E-Aradhana Online Sankalp Pujan',
      duration: 'Remote Sankalp',
      basePrice: 2100.0,
      personsIncluded: 1,
      extraPersonFee: 0.0,
      description: 'Live remote Sankalp puja conducted in devotee gotra with Prasad dispatched to doorstep.',
    },
    {
      category: 'Parikrama',
      name: 'Heritage Walk - Omkar Parvat Parikrama',
      duration: '3 Hours',
      basePrice: 500.0,
      personsIncluded: 1,
      extraPersonFee: 500.0,
      description: 'Guided heritage walk around sacred Mandhata Island covering ancient shrines and viewpoints.',
    },
  ];

  for (const p of pujaServices) {
    const existing = await prisma.pujaService.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.pujaService.create({ data: p });
    }
  }

  // 4. Accommodation Rooms
  const rooms = [
    { name: 'Vishramalaya Night Stay', roomType: 'Deluxe AC', basePath: '1500.00', maxCapacity: 4, totalRooms: 40 },
    { name: 'Vishramalaya Night Stay', roomType: 'Family Non-AC', basePath: '800.00', maxCapacity: 5, totalRooms: 50 },
    { name: 'Vishramalaya Day Stay', roomType: 'Rest Room', basePath: '500.00', maxCapacity: 4, totalRooms: 20 },
  ];

  for (const r of rooms) {
    const existing = await prisma.accommodationRoom.findFirst({ where: { roomType: r.roomType } });
    if (!existing) {
      await prisma.accommodationRoom.create({
        data: {
          name: r.name,
          roomType: r.roomType,
          basePrice: parseFloat(r.basePath),
          maxCapacity: r.maxCapacity,
          totalRooms: r.totalRooms,
        },
      });
    }
  }

  // 5. Mahaprasad Product & Variants
  let ladduProduct = await prisma.product.findFirst({ where: { name: 'Laddu Mahaprasad' } });
  if (!ladduProduct) {
    ladduProduct = await prisma.product.create({
      data: {
        name: 'Laddu Mahaprasad',
        description: 'Pure Desi Ghee Besan Laddu Mahaprasad prepared under strict hygiene in the temple Prasadalaya.',
      },
    });

    await prisma.productVariant.createMany({
      data: [
        { productId: ladduProduct.id, weight: '250g', price: 120.0, stockQty: 1000 },
        { productId: ladduProduct.id, weight: '500g', price: 240.0, stockQty: 1000 },
        { productId: ladduProduct.id, weight: '1kg', price: 480.0, stockQty: 1000 },
      ],
    });
  }

  // 6. Donation Categories
  const donationCategories = [
    { code: 'TRUST_FUND', name: 'General Trust Fund', description: 'General corpus fund for mandir maintenance and administration.' },
    { code: 'ANN_KSHETRA', name: 'Ann Kshetra Meal Sponsorship', description: 'Feed pilgrims and sadhus with daily free pure meals.' },
    { code: 'SHAYAN_SHRINGAR', name: 'Shayan Shringar Daan', description: 'Night Shayan Aarti decor and floral adornment sponsorship.' },
    { code: 'SAMANYA_SHRINGAR', name: 'Samanya Shringar', description: 'Daily sacred chandan and bilvapatra shringar seva.' },
    { code: 'VISHESH_SHRINGAR', name: 'Vishesh Shringar', description: 'Special grand floral festival decoration.' },
    { code: 'NAIVEDYA_BHOG', name: 'Samanya Naivedya Bhog', description: 'Daily holy Rajbhog offering to Bhagwan Shiva.' },
    { code: 'KHICHDI_501', name: 'Khichdi Sewa Daan 501', description: 'Hot nutritious khichdi prasad distribution sponsorship.' },
    { code: 'KHICHDI_1101', name: 'Khichdi Sewa Daan 1101', description: 'Large scale hot khichdi prasad distribution.' },
    { code: 'NANDA_DEEPAK', name: 'Nanda Deepak Deep Ghrit', description: 'Pure Desi Cow Ghee for eternal Akhand Jyoti.' },
    { code: 'ROOM_DONATION', name: 'Vishramalaya Room Donation', description: 'Contribution for pilgrim bhavan and room construction.' },
  ];

  for (const dc of donationCategories) {
    await prisma.donationCategory.upsert({
      where: { code: dc.code },
      update: {},
      create: dc,
    });
  }

  // 7. News Announcements
  const newsItems = [
    {
      title: 'Ayushman Vay Vandana Scheme Camp Held at Omkareshwar Temple Trust',
      summary: 'A special camp for issuing Ayushman cards under the Ayushman Vay Vandana Scheme was organized for employees and outsourced personnel.',
      content: 'A special welfare initiative was conducted under the supervision of SDM Pankaj Verma to ensure health coverage for all temple seva personnel.',
    },
    {
      title: 'Temple Trust Reviews Arrangements to Improve Devotee Services',
      summary: 'A meeting of supervisors and officials was held under Managing Trustee Shri Rao Pushpendra Singh Chauhan.',
      content: 'Key points discussed included crowd control along Nagar Ghat, water cooler stations, fast queue verification, and cleanliness.',
    },
    {
      title: 'Special Cleanliness Drive Held at Gaumukh Ghat on Gandhi Jayanti',
      summary: 'Public representatives, saints, boat operators, and residents took a collective pledge to maintain river ghat purity.',
      content: 'The temple administration regularly organizes cleanliness initiatives across all holy river ghats of Maa Narmada.',
    },
  ];

  for (const ni of newsItems) {
    const existing = await prisma.newsAnnouncement.findFirst({ where: { title: ni.title } });
    if (!existing) {
      await prisma.newsAnnouncement.create({ data: ni });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
