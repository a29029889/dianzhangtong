import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId },
      relations: ['category', 'shop'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, userId },
      relations: ['category', 'shop'],
    });
    if (!account) {
      throw new NotFoundException('账目不存在');
    }
    return account;
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: {
        userId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['category', 'shop'],
      order: { date: 'DESC' },
    });
  }

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create({
      ...createAccountDto,
      userId,
      date: createAccountDto.date ? new Date(createAccountDto.date) : new Date(),
    });
    return this.accountsRepository.save(account);
  }

  async update(id: string, userId: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findById(id, userId);
    Object.assign(account, updateAccountDto);
    if (updateAccountDto.date) {
      account.date = new Date(updateAccountDto.date);
    }
    return this.accountsRepository.save(account);
  }

  async delete(id: string, userId: string): Promise<void> {
    const account = await this.findById(id, userId);
    await this.accountsRepository.remove(account);
  }

  async getStatistics(userId: string, startDate: string, endDate: string) {
    const accounts = await this.findByDateRange(userId, startDate, endDate);
    
    const income = accounts
      .filter(a => a.type === 'income')
      .reduce((sum, a) => sum + Number(a.amount), 0);
    
    const expense = accounts
      .filter(a => a.type === 'expense')
      .reduce((sum, a) => sum + Number(a.amount), 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      count: accounts.length,
    };
  }
}
