import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JoinQueueDto } from './dto/join-queue.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('join')
  async join(@CurrentUser() user: { id: string }, @Body() dto: JoinQueueDto) {
    return this.queueService.joinQueue(user.id, dto.unitId);
  }

  @Get('my')
  async getMy(@CurrentUser() user: { id: string }) {
    return this.queueService.getMyQueues(user.id);
  }

  @Get(':id')
  async getById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.queueService.getQueueById(user.id, id);
  }

  @Post(':id/cancel')
  async cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.queueService.cancelQueue(user.id, id);
  }
}
