import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { UserContentService } from '../user-content/user-content.service';
import { UserContentService as DBUserContentService } from '../../database/user-content/user-content.service';
import { PrismaService } from '../../database/prisma.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [UserContentService, DBUserContentService, PrismaService],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
