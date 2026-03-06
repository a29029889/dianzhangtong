import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_settings')
export class NotificationSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'boolean', default: true })
  lowStockAlert: boolean;

  @Column({ type: 'boolean', default: false })
  dailyReport: boolean;

  @Column({ type: 'boolean', default: false })
  monthlyReport: boolean;

  @Column({ type: 'boolean', default: true })
  billReminder: boolean;

  @Column({ type: 'int', default: 9 })
  reportHour: number;

  @Column({ type: 'varchar', default: 'wechat' })
  notificationChannel: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
