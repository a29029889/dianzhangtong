import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    return this.accountsService.create({
      ...body,
      userId: req.user.userId,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.accountsService.delete(id);
  }
}
