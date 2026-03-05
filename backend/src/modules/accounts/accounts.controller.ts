import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get('statistics')
  getStatistics(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountsService.getStatistics(req.user.userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findById(id, req.user.userId);
  }

  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @Request() req) {
    return this.accountsService.create(req.user.userId, createAccountDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req,
  ) {
    return this.accountsService.update(id, req.user.userId, updateAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.accountsService.delete(id, req.user.userId);
  }
}
