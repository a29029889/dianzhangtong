import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
  ) {}

  async findAll(userId: string): Promise<Shop[]> {
    return this.shopsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({
      where: { id, userId },
    });
    if (!shop) {
      throw new NotFoundException('店铺不存在');
    }
    return shop;
  }

  async create(userId: string, createShopDto: CreateShopDto): Promise<Shop> {
    const shop = this.shopsRepository.create({
      ...createShopDto,
      userId,
    });
    return this.shopsRepository.save(shop);
  }

  async update(id: string, userId: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.findById(id, userId);
    Object.assign(shop, updateShopDto);
    return this.shopsRepository.save(shop);
  }

  async delete(id: string, userId: string): Promise<void> {
    const shop = await this.findById(id, userId);
    await this.shopsRepository.remove(shop);
  }
}
