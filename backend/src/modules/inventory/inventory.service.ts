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

  async updateLowStockThreshold(id: string, threshold: number): Promise<Product> {
    await this.productsRepository.update(id, { lowStockThreshold: threshold });
    return this.productsRepository.findOne({ where: { id } });
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }

  // 获取库存预警列表
  async getLowStockProducts(userId: string): Promise<Product[]> {
    const products = await this.productsRepository.find({
      where: { userId },
    });
    
    // 筛选库存低于阈值的商品
    return products.filter(p => p.stock <= p.lowStockThreshold);
  }

  // 获取需要预警的商品统计
  async getLowStockStats(userId: string): Promise<{ total: number; lowStock: number; outOfStock: number }> {
    const products = await this.productsRepository.find({
      where: { userId },
    });
    
    const total = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    return { total, lowStock, outOfStock };
  }
}
