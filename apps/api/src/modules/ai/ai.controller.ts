import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateTestsDto,
  GenerateTestsResponseDto,
  GenerateBddDto,
  GenerateBddResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-tests')
  @ApiOperation({
    summary: 'Generate test cases from requirements',
    description:
      'Uses AI to analyze the provided description and generate structured test cases with steps, expected results, and metadata.',
  })
  @ApiResponse({
    status: 201,
    description: 'Test cases generated successfully',
    type: GenerateTestsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 502, description: 'AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  @ApiResponse({ status: 504, description: 'AI service timeout' })
  async generateTests(
    @Body() dto: GenerateTestsDto,
  ): Promise<GenerateTestsResponseDto> {
    return this.aiService.generateTests(dto);
  }

  @Post('generate-bdd')
  @ApiOperation({
    summary: 'Generate BDD scenarios in Gherkin format',
    description:
      'Uses AI to create behavior-driven development scenarios with Given/When/Then steps, optional examples tables, and tags.',
  })
  @ApiResponse({
    status: 201,
    description: 'BDD scenarios generated successfully',
    type: GenerateBddResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 502, description: 'AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  @ApiResponse({ status: 504, description: 'AI service timeout' })
  async generateBdd(
    @Body() dto: GenerateBddDto,
  ): Promise<GenerateBddResponseDto> {
    return this.aiService.generateBdd(dto);
  }
}
