import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, ILike } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto, QueryAccountDto, PaginatedAccountDto } from './dto/account.dto';
import { AccountType } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  // 基础查询 - 获取所有记录（已废弃，使用 findAllPaginated 代替）
  async findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId },
      relations: ['category', 'shop'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  // 分页筛选查询
  async findAllPaginated(userId: string, query: QueryAccountDto): Promise<PaginatedAccountDto<Account>> {
    const { type, categoryId, shopId, startDate, endDate, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Account> = { userId };

    // 按类型筛选
    if (type) {
      where.type = type;
    }

    // 按分类筛选
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 按店铺筛选
    if (shopId) {
      where.shopId = shopId;
    }

    // 按日期范围筛选
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.date = Between(new Date(startDate), new Date(startDate + 'T23:59:59'));
    }

    // 查询数据
    const [data, total] = await this.accountsRepository.findAndCount({
      where,
      relations: ['category', 'shop'],
      order: { date: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  // ====== 统计功能 ======

  // 基础统计
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

  // 余额统计 - 计算累计余额
  async getBalance(userId: string, endDate?: string): Promise<{ balance: number; totalIncome: number; totalExpense: number }> {
    const where: FindOptionsWhere<Account> = { userId };
    
    if (endDate) {
      where.date = Between(new Date('1970-01-01'), new Date(endDate));
    }

    const accounts = await this.accountsRepository.find({ where });
    
    const totalIncome = accounts
      .filter(a => a.type === 'income')
      .reduce((sum, a) => sum + Number(a.amount), 0);
    
    const totalExpense = accounts
      .filter(a => a.type === 'expense')
      .reduce((sum, a) => sum + Number(a.amount), 0);

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
    };
  }

  // 按日期统计（日/周/月）
  async getTrendByPeriod(
    userId: string, 
    startDate: string, 
    endDate: string, 
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<{ date: string; income: number; expense: number; balance: number }[]> {
    const accounts = await this.findByDateRange(userId, startDate, endDate);
    
    // 按日期分组
    const grouped = new Map<string, { income: number; expense: number }>();
    
    accounts.forEach(account => {
      const date = new Date(account.date);
      let key: string;
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        // 获取周一的日期
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        key = monday.toISOString().split('T')[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, { income: 0, expense: 0 });
      }
      
      const group = grouped.get(key)!;
      if (account.type === 'income') {
        group.income += Number(account.amount);
      } else {
        group.expense += Number(account.amount);
      }
    });

    // 转换为数组并排序
    const result = Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  // 分类统计 - 收入/支出按分类占比
  async getCategoryBreakdown(
    userId: string, 
    startDate: string, 
    endDate: string, 
    type?: AccountType
  ): Promise<{ categoryId: string | null; categoryName: string; amount: number; percentage: number }[]> {
    const where: FindOptionsWhere<Account> = { userId };
    
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    
    if (type) {
      where.type = type;
    }

    const accounts = await this.accountsRepository.find({
      where,
      relations: ['category'],
    });

    // 按分类分组
    const grouped = new Map<string | null, number>();
    let total = 0;
    
    accounts.forEach(account => {
      const categoryId = account.categoryId;
      const categoryName = account.category?.name || '未分类';
      const key = categoryId || 'uncategorized';
      
      if (!grouped.has(key)) {
        grouped.set(key, 0);
      }
      
      const current = grouped.get(key)!;
      grouped.set(key, current + Number(account.amount));
      total += Number(account.amount);
    });

    // 转换为数组
    const result = Array.from(grouped.entries())
      .map(([key, amount]) => {
        let categoryName = '未分类';
        if (key !== 'uncategorized') {
          const category = accounts.find(a => a.categoryId === key)?.category;
          categoryName = category?.name || '未分类';
        }
        
        return {
          categoryId: key === 'uncategorized' ? null : key,
          categoryName,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return result;
  }

  // 获取今日/本周/本月统计
  async getQuickStats(userId: string): Promise<{
    today: { income: number; expense: number; balance: number };
    week: { income: number; expense: number; balance: number };
    month: { income: number; expense: number; balance: number };
  }> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // 本周开始（周一）
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    // 本月开始
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const [todayAccounts, weekAccounts, monthAccounts] = await Promise.all([
      this.findByDateRange(userId, todayStr, todayStr),
      this.findByDateRange(userId, weekStartStr, todayStr),
      this.findByDateRange(userId, monthStartStr, todayStr),
    ]);

    const calculateStats = (accounts: Account[]) => {
      const income = accounts.filter(a => a.type === 'income').reduce((sum, a) => sum + Number(a.amount), 0);
      const expense = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + Number(a.amount), 0);
      return { income, expense, balance: income - expense };
    };

    return {
      today: calculateStats(todayAccounts),
      week: calculateStats(weekAccounts),
      month: calculateStats(monthAccounts),
    };
  }
}
