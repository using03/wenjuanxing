import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatService } from './stat.service';

@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get(':questionId')
  async getQuestionStat(
    @Param('questionId') questionId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return await this.statService.getQuestionStatListAndCount(questionId, {
      page,
      pageSize,
    });
  }

  @Get(':questionId/:componentFeId')
  async getComponentStat(
    @Param('questionId') questionId: string,
    @Param('componentFeId') componentFeId: string,
  ) {
    console.log('questionId', questionId, ' componentFeId', componentFeId);
    const stat = await this.statService.getComponentStat(
      questionId,
      componentFeId,
    );
    console.log('stat,', stat);
    return { stat }; // 返回一个对象，对象里的 stat 是数组
  }
}
