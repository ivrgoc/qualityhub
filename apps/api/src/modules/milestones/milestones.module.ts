import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { Milestone } from './entities/milestone.entity';
import { TestPlan } from '../test-plans/entities/test-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Milestone, TestPlan])],
  controllers: [MilestonesController],
  providers: [MilestonesService],
  exports: [MilestonesService, TypeOrmModule],
})
export class MilestonesModule {}
