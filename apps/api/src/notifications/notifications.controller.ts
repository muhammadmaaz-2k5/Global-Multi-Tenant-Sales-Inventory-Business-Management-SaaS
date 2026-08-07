import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';

@UseGuards(JwtAuthGuard, OrgMemberGuard)
@Controller('organizations/:orgId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread')
  getUnread(
    @Param('orgId') orgId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.notificationsService.getUnread(orgId, req.user.sub);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.notificationsService.markAsRead(orgId, req.user.sub, id);
  }
}
