import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(userId: string, type: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId, type: type as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });
    return this.categoriesRepository.save(category);
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id, userId);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findById(id, userId);
    await this.categoriesRepository.remove(category);
  }
}
