import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController, StripeWebhookController } from './stripe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
