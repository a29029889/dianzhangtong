import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  accountId: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'enum', enum: AttachmentType, default: AttachmentType.OTHER })
  mimeType: AttachmentType;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.attachments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
