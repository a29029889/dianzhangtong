import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';

@Controller('shops')
@UseGuards(JwtAuthGuard)
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Get()
  findAll(@Request() req) {
    return this.shopsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.shopsService.findById(id, req.user.userId);
  }

  @Post()
  create(@Body() createShopDto: CreateShopDto, @Request() req) {
    return this.shopsService.create(req.user.userId, createShopDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @Request() req,
  ) {
    return this.shopsService.update(id, req.user.userId, updateShopDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.shopsService.delete(id, req.user.userId);
  }
}
