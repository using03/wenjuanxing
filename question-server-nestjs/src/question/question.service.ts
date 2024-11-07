import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './schemas/question.schema';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import { AnswerService } from 'src/answer/answer.service';

@Injectable()
export class QuestionService {
  constructor(
    // 依赖注入 向 QuestionService 注入一个属性，叫做 questionModel
    @InjectModel(Question.name) private readonly questionModel,
    private readonly answerService: AnswerService,
  ) {}

  async create(username: string) {
    const question = new this.questionModel({
      // 此处数据要和 schema 里对应好
      title: '问卷标题' + Date.now(),
      desc: '问卷描述',
      author: username,
      // answerCount: 0, //*
      componentList: [
        {
          fe_id: nanoid(),
          type: 'questionInfo',
          title: '问卷信息',
          props: { title: '问卷标题', desc: '问卷描述...' },
        },
      ],
    });

    return await question.save();
  }

  async delete(id: string, author: string) {
    // return await this.questionModel.findByIdAndDelete(id);
    const res = await this.questionModel.findOneAndDelete({
      _id: id,
      author,
    });

    return res;
  }

  async deleteMany(ids: string[], author: string) {
    const res = await this.questionModel.deleteMany({
      _id: { $in: ids },
      author,
    });
    return res;
  }

  async update(id: string, updateData, author) {
    return await this.questionModel.updateOne({ _id: id, author }, updateData);
  }

  //*
  async updateAnswerCount(questionId: string): Promise<void> {
    const answerCount = await this.answerService.count(questionId);

    await this.questionModel.updateOne(
      { _id: questionId },
      { $set: { answerCount } },
    );
  }

  async findOne(id: string) {
    return await this.questionModel.findById(id);
  }

  async findAllList({
    keyword = '',
    page = 1,
    pageSize = 10,
    isDeleted = false,
    isStar,
    author = '',
  }) {
    const whereOpt: any = {
      author,
      isDeleted,
    };
    if (isStar !== false) whereOpt.isStar = isStar;
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      whereOpt.title = { $regex: reg }; // 模糊搜索 （条件是能否匹配 title属性）
    }

    return await this.questionModel
      .find(whereOpt)
      .sort({ _id: -1 }) // 根据 _id 的逆序排序
      .skip((page - 1) * pageSize) // 分页 （跳过当前页前面的页的内容）
      .limit(pageSize); // 限制取的条数 （一页的数量）
  }

  async countAll({ keyword = '', isDeleted = false, isStar, author = '' }) {
    const whereOpt: any = {
      author,
      isDeleted,
    };
    if (isStar !== false) whereOpt.isStar = isStar;
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      whereOpt.title = { $regex: reg }; // 模糊搜索 （条件是能否匹配 title属性）
    }
    return await this.questionModel.countDocuments(whereOpt);
  }

  async duplicate(id: string, author: string) {
    const question = await this.questionModel.findById(id);
    const newQuestion = new this.questionModel({
      ...question.toObject(),
      _id: new mongoose.Types.ObjectId(), // 生成一个新的 mongodb 的 ObjectId
      title: question.title + ' 副本',
      author,
      isPublished: false,
      isStar: false,
      componentList: question.componentList.map((item) => {
        return {
          ...item,
          fe_id: nanoid(),
        };
      }),
    });
    return await newQuestion.save();
  }
}
