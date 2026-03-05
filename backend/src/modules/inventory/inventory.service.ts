import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(userId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    return this.productsRepository.save(product);
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    await this.productsRepository.update(id, { stock });
    return this.productsRepository.findOne({ where: { id } });
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
