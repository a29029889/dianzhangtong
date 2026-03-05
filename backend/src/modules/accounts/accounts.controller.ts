import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto, UpdateAccountDto, QueryAccountDto } from './dto/account.dto';
import { AccountType } from './entities/account.entity';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  // 分页筛选查询
  @Get()
  findAll(@Request() req, @Query() query: QueryAccountDto) {
    return this.accountsService.findAllPaginated(req.user.userId, query);
  }

  // 快捷统计（今日/本周/本月）
  @Get('quick-stats')
  getQuickStats(@Request() req) {
    return this.accountsService.getQuickStats(req.user.userId);
  }

  // 余额统计
  @Get('balance')
  getBalance(
    @Request() req,
    @Query('endDate') endDate: string,
  ) {
    return this.accountsService.getBalance(req.user.userId, endDate);
  }

  // 趋势分析（日/周/月）
  @Get('trend')
  getTrend(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.accountsService.getTrendByPeriod(req.user.userId, startDate, endDate, period);
  }

  // 分类占比统计
  @Get('category-breakdown')
  getCategoryBreakdown(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: AccountType,
  ) {
    return this.accountsService.getCategoryBreakdown(req.user.userId, startDate, endDate, type);
  }

  // 基础统计（兼容旧版）
  @Get('statistics')
  getStatistics(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountsService.getStatistics(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.accountsService.findById(id, req.user.userId);
  }

  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @Request() req) {
    return this.accountsService.create(req.user.userId, createAccountDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req,
  ) {
    return this.accountsService.update(id, req.user.userId, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.accountsService.delete(id, req.user.userId);
  }
}
