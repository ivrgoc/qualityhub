import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';
import { Requirement } from './entities/requirement.entity';
import { RequirementCoverage } from './entities/requirement-coverage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Requirement, RequirementCoverage])],
  controllers: [RequirementsController],
  providers: [RequirementsService],
  exports: [RequirementsService, TypeOrmModule],
})
export class RequirementsModule {}
