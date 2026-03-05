import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  async findAll(@Request() req) {
    return this.inventoryService.findAll(req.user.userId);
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    return this.inventoryService.create({
      ...body,
      userId: req.user.userId,
    });
  }

  @Put(':id/stock')
  async updateStock(@Param('id') id: string, @Body() body: { stock: number }) {
    return this.inventoryService.updateStock(id, body.stock);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.inventoryService.delete(id);
  }
}
