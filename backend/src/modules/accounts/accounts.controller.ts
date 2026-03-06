import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto, UpdateAccountDto, QueryAccountDto } from './dto/account.dto';
import { AccountType } from './entities/account.entity';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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

  // 导出数据
  @Get('export')
  async exportData(@Request() req, @Res() res: Response) {
    const data = await this.accountsService.exportAll(req.user.userId);
    
    // 设置 CSV 响应头
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=dianzhangtong_export_${Date.now()}.csv`);
    
    // 转换为 CSV
    const headers = ['日期', '类型', '金额', '分类', '店铺', '备注'];
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const row = [
        item.date,
        item.type === 'income' ? '收入' : '支出',
        item.amount,
        item.categoryName || '',
        item.shopName || '',
        (item.description || '').replace(/,/g, '，')
      ];
      csvRows.push(row.join(','));
    });
    
    // 添加 BOM 以支持中文
    res.send('\ufeff' + csvRows.join('\n'));
  }

  // 导入数据
  @Post('import')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
      }
    })
  }))
  async importData(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      return { success: false, message: '请上传文件' };
    }
    
    const result = await this.accountsService.importData(req.user.userId, file.path);
    return result;
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
