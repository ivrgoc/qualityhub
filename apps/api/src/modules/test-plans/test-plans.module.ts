import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPlansController } from './test-plans.controller';
import { TestPlansService } from './test-plans.service';
import { TestPlan } from './entities/test-plan.entity';
import { TestPlanEntry } from './entities/test-plan-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestPlan, TestPlanEntry])],
  controllers: [TestPlansController],
  providers: [TestPlansService],
  exports: [TestPlansService, TypeOrmModule],
})
export class TestPlansModule {}
