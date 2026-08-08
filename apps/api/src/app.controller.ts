import { Controller, Get } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/debug-sentry")
  getError() {
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_endpoint',
    });
    Sentry.metrics.count('test_counter', 1);
    throw new Error("My first Sentry error!");
  }
}
