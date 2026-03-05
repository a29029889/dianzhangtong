import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Category } from '../../categories/entities/category.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联
  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Shop, shop => shop.user)
  shops: Shop[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @OneToMany(() => Attachment, attachment => attachment.user)
  attachments: Attachment[];
}
