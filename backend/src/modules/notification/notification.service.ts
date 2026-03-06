import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationSetting)
    private notificationRepository: Repository<NotificationSetting>,
  ) {}

  async getSettings(userId: string): Promise<NotificationSetting> {
    let settings = await this.notificationRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // 创建默认设置
      settings = await this.notificationRepository.save({
        userId,
        lowStockAlert: true,
        dailyReport: false,
        monthlyReport: false,
        billReminder: true,
        reportHour: 9,
        notificationChannel: 'wechat',
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: Partial<NotificationSetting>): Promise<NotificationSetting> {
    let settings = await this.notificationRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = await this.notificationRepository.save({
        userId,
        ...data,
      });
    } else {
      await this.notificationRepository.update(settings.id, data);
      settings = await this.notificationRepository.findOne({
        where: { userId },
      });
    }

    return settings;
  }
}
