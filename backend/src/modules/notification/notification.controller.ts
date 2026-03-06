import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('settings')
  async getSettings(@Request() req) {
    return this.notificationService.getSettings(req.user.userId);
  }

  @Put('settings')
  async updateSettings(@Request() req, @Body() body: any) {
    return this.notificationService.updateSettings(req.user.userId, body);
  }
}
