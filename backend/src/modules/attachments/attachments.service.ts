import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { CreateAttachmentDto, UpdateAttachmentDto, QueryAttachmentDto } from './dto/attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  async findAll(userId: string): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { userId },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPaginated(
    userId: string, 
    query: QueryAttachmentDto
  ): Promise<{ data: Attachment[]; total: number; page: number; limit: number; totalPages: number }> {
    const { accountId, mimeType, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Attachment> = { userId };

    if (accountId) {
      where.accountId = accountId;
    }

    if (mimeType) {
      where.mimeType = mimeType;
    }

    const [data, total] = await this.attachmentsRepository.findAndCount({
      where,
      relations: ['account'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<Attachment> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id, userId },
      relations: ['account'],
    });
    if (!attachment) {
      throw new NotFoundException('附件不存在');
    }
    return attachment;
  }

  async findByAccountId(accountId: string, userId: string): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { accountId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const attachment = this.attachmentsRepository.create({
      ...createAttachmentDto,
      userId,
    });
    return this.attachmentsRepository.save(attachment);
  }

  async update(
    id: string, 
    userId: string, 
    updateAttachmentDto: UpdateAttachmentDto
  ): Promise<Attachment> {
    const attachment = await this.findById(id, userId);
    Object.assign(attachment, updateAttachmentDto);
    return this.attachmentsRepository.save(attachment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const attachment = await this.findById(id, userId);
    await this.attachmentsRepository.remove(attachment);
  }

  // 批量获取某个账户的所有附件
  async getByAccountIds(accountIds: string[], userId: string): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: {
        userId,
        accountId: undefined as any, // TypeORM bug workaround
      } as FindOptionsWhere<Attachment>,
    });
  }
}
