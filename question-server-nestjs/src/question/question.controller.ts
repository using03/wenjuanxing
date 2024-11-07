import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  Request,
  // HttpException,
  // HttpStatus,
} from '@nestjs/common';
import { QuestionDto } from './dto/question.dto';
import { QuestionService } from './question.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('question')
export class QuestionController {
  // 依赖注入 将 questionService 属性注入到 Controller
  constructor(private readonly questionService: QuestionService) {}

  // @Get('test')
  // getTest(): string {
  //   throw new HttpException('获取数据失败', HttpStatus.BAD_REQUEST);
  //   // return 'question Test';
  // }

  @Post()
  create(@Request() req) {
    const { username } = req.user;
    return this.questionService.create(username);
  }

  @Get() // method Get请求
  async findAll(
    @Query('keyword') keyword: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('isDeleted') isDeleted: boolean = false,
    @Query('isStar') isStar: boolean = false,
    @Request() req,
    // 圆括号内的字符串必须和url上的变量名对应起来，圆括号外面的可以自由更改
  ) {
    const { username } = req.user;
    const list = await this.questionService.findAllList({
      keyword,
      page,
      pageSize,
      isDeleted,
      isStar,
      author: username,
    });
    const count = await this.questionService.countAll({
      keyword,
      isDeleted,
      isStar,
      author: username,
    });

    await list.map((l) => {
      l.answerCount = this.questionService.updateAnswerCount(l._id.toString());
    });

    return {
      list,
      count,
    };
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string, // 圆括号里的字符串要与路由形如":id"的参数对应起来，圆括号外的自由定义
  ) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() questionDto: QuestionDto,
    @Request() req,
  ) {
    const { username } = req.user;
    return this.questionService.update(id, questionDto, username);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string, @Request() req) {
    const { username } = req.username;
    return this.questionService.delete(id, username);
  }

  @Delete()
  deleteMany(@Body() body, @Request() req) {
    const { username } = req.user;
    const { ids = [] } = body;
    return this.questionService.deleteMany(ids, username);
  }

  @Post('duplicate/:id')
  duplicate(@Param('id') id: string, @Request() req) {
    const { username } = req.user;
    return this.questionService.duplicate(id, username);
  }
}
