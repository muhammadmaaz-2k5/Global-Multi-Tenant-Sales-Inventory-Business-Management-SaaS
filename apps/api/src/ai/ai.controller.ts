import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMemberGuard } from '../auth/org-member.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, OrgMemberGuard, RolesGuard)
@Controller('organizations/:orgId/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Roles(Role.OWNER, Role.MANAGER) // Only owners/managers can use AI
  @Post('query')
  query(@Param('orgId') orgId: string, @Body('question') question: string) {
    return this.aiService.query(orgId, question);
  }
}
