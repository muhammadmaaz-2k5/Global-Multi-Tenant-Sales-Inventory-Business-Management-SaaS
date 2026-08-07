import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { CacheModule } from './cache/cache.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { LocationsModule } from './locations/locations.module';
import { InventoryModule } from './inventory/inventory.module';
import { PosCartsModule } from './pos-carts/pos-carts.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CacheModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    LocationsModule,
    InventoryModule,
    PosCartsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
