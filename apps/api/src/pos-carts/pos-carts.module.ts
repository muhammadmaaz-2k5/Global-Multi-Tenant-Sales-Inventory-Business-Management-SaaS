import { Module } from '@nestjs/common';
import { PosCartsController } from './pos-carts.controller';
import { PosCartsService } from './pos-carts.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PosCartsController],
  providers: [PosCartsService],
})
export class PosCartsModule {}
