import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesController } from './test-cases.controller';
import { TestCasesService } from './test-cases.service';
import { TestCase } from './entities/test-case.entity';
import { TestCaseVersion } from './entities/test-case-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase, TestCaseVersion])],
  controllers: [TestCasesController],
  providers: [TestCasesService],
  exports: [TestCasesService, TypeOrmModule],
})
export class TestCasesModule {}
