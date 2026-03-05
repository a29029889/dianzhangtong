import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAttachmentDto, UpdateAttachmentDto, QueryAttachmentDto } from './dto/attachment.dto';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  // 分页筛选查询
  @Get()
  findAll(@Request() req, @Query() query: QueryAttachmentDto) {
    return this.attachmentsService.findAllPaginated(req.user.userId, query);
  }

  // 获取所有附件
  @Get('all')
  findAllList(@Request() req) {
    return this.attachmentsService.findAll(req.user.userId);
  }

  // 根据账户获取附件
  @Get('account/:accountId')
  findByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Request() req,
  ) {
    return this.attachmentsService.findByAccountId(accountId, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.attachmentsService.findById(id, req.user.userId);
  }

  @Post()
  create(@Body() createAttachmentDto: CreateAttachmentDto, @Request() req) {
    return this.attachmentsService.create(req.user.userId, createAttachmentDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @Request() req,
  ) {
    return this.attachmentsService.update(id, req.user.userId, updateAttachmentDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.attachmentsService.delete(id, req.user.userId);
  }
}
