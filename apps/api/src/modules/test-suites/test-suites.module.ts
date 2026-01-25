import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSuitesController } from './test-suites.controller';
import { TestSuitesService } from './test-suites.service';
import { TestSuite } from './entities/test-suite.entity';
import { Section } from './entities/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestSuite, Section])],
  controllers: [TestSuitesController],
  providers: [TestSuitesService],
  exports: [TestSuitesService, TypeOrmModule],
})
export class TestSuitesModule {}
