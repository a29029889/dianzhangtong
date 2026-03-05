import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(account: Partial<Account>): Promise<Account> {
    return this.accountsRepository.save(account);
  }

  async findById(id: string): Promise<Account | undefined> {
    return this.accountsRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.accountsRepository.delete(id);
  }
}
