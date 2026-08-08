import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { Request } from 'express';

@Controller('organizations/:orgId/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard, OrgMemberGuard)
  @Post('checkout')
  async createCheckoutSession(
    @Param('orgId') orgId: string,
    @Body('tier') tier: string,
  ) {
    return this.stripeService.createCheckoutSession(orgId, tier);
  }
}

@Controller('stripe/webhook')
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    return this.stripeService.handleWebhook(signature, req.rawBody!);
  }
}
