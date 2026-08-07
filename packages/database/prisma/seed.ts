import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing data (optional, but good for fresh seeds)
  // Be careful with this in production! We only do this if explicitly needed or just rely on upsert.
  // For safety, we will use upsert for everything.

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 2. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@shopflow.app' },
    update: {},
    create: {
      email: 'admin@shopflow.app',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: defaultPassword,
      isSuperAdmin: true,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 3. Create Tenant Owner & Organization
  const tenantUser = await prisma.user.upsert({
    where: { email: 'owner@techstore.com' },
    update: {},
    create: {
      email: 'owner@techstore.com',
      firstName: 'Tech',
      lastName: 'Owner',
      passwordHash: defaultPassword,
      isSuperAdmin: false,
    },
  });

  const tenantOrg = await prisma.organization.upsert({
    where: { slug: 'techstore-nyc' },
    update: {},
    create: {
      name: 'TechStore NYC',
      slug: 'techstore-nyc',
      currency: 'USD',
      timezone: 'America/New_York',
      defaultTaxRate: 8.875,
    },
  });

  // Link Owner to Org
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: tenantUser.id,
        organizationId: tenantOrg.id,
      },
    },
    update: { role: 'OWNER' },
    create: {
      userId: tenantUser.id,
      organizationId: tenantOrg.id,
      role: 'OWNER',
    },
  });
  console.log(`✅ Tenant Organization created: ${tenantOrg.name}`);

  // 4. Create Locations
  const location = await prisma.location.create({
    data: {
      organizationId: tenantOrg.id,
      name: 'Manhattan Flagship',
      type: 'STORE',
      address: '123 Broadway, NY 10001',
    },
  });
  const warehouse = await prisma.location.create({
    data: {
      organizationId: tenantOrg.id,
      name: 'Brooklyn Warehouse',
      type: 'WAREHOUSE',
      address: '456 Industrial Pkwy, NY 11201',
    },
  });
  console.log(`✅ Locations created`);

  // 5. Create Categories & Brands
  const category = await prisma.category.create({
    data: {
      organizationId: tenantOrg.id,
      name: 'Laptops',
    },
  });
  const brand = await prisma.brand.create({
    data: {
      organizationId: tenantOrg.id,
      name: 'Apple',
    },
  });
  console.log(`✅ Categories and Brands created`);

  // 6. Create Products & Variants
  const product = await prisma.product.create({
    data: {
      organizationId: tenantOrg.id,
      categoryId: category.id,
      brandId: brand.id,
      name: 'MacBook Pro 16"',
      description: 'M3 Max, 36GB RAM, 1TB SSD',
      basePrice: 3499.00,
      variants: {
        create: [
          {
            name: 'Space Black',
            sku: 'MBP16-M3-SB',
            barcode: '194253000001',
          },
          {
            name: 'Silver',
            sku: 'MBP16-M3-SL',
            barcode: '194253000002',
          },
        ],
      },
    },
    include: { variants: true },
  });
  console.log(`✅ Products created`);

  // 7. Create Inventory Levels
  for (const variant of product.variants) {
    await prisma.inventoryLevel.create({
      data: {
        variantId: variant.id,
        locationId: location.id,
        quantity: 15,
      },
    });
    await prisma.inventoryLevel.create({
      data: {
        variantId: variant.id,
        locationId: warehouse.id,
        quantity: 50,
      },
    });
  }
  console.log(`✅ Inventory levels initialized`);

  // 8. Create Customers
  await prisma.customer.create({
    data: {
      organizationId: tenantOrg.id,
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      phone: '555-0101',
    },
  });
  console.log(`✅ Customers created`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
