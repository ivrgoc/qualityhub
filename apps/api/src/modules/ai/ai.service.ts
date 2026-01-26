import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import {
  GenerateTestsDto,
  GenerateTestsResponseDto,
  GenerateBddDto,
  GenerateBddResponseDto,
} from './dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly httpService: HttpService) {}

  async generateTests(dto: GenerateTestsDto): Promise<GenerateTestsResponseDto> {
    this.logger.log(
      `Generating tests for description: ${dto.description.substring(0, 50)}...`,
    );

    const response = await firstValueFrom(
      this.httpService.post<GenerateTestsResponseDto>('/generate/tests', dto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Failed to generate tests: ${error.message}`,
            error.stack,
          );
          throw this.handleAiServiceError(error);
        }),
      ),
    );

    this.logger.log(
      `Generated ${response.data.test_cases.length} test cases`,
    );
    return response.data;
  }

  async generateBdd(dto: GenerateBddDto): Promise<GenerateBddResponseDto> {
    this.logger.log(
      `Generating BDD scenarios for: ${dto.feature_description.substring(0, 50)}...`,
    );

    const response = await firstValueFrom(
      this.httpService.post<GenerateBddResponseDto>('/generate/bdd', dto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            `Failed to generate BDD scenarios: ${error.message}`,
            error.stack,
          );
          throw this.handleAiServiceError(error);
        }),
      ),
    );

    this.logger.log(
      `Generated ${response.data.scenarios.length} BDD scenarios`,
    );
    return response.data;
  }

  private handleAiServiceError(error: AxiosError): HttpException {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { detail?: string };
      const message = data?.detail || 'AI service error';

      if (status === 422) {
        return new HttpException(
          { message: 'Invalid request to AI service', details: data },
          HttpStatus.BAD_REQUEST,
        );
      }

      return new HttpException(
        { message },
        status >= 500 ? HttpStatus.BAD_GATEWAY : status,
      );
    }

    if (error.code === 'ECONNREFUSED') {
      return new HttpException(
        { message: 'AI service is unavailable' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return new HttpException(
        { message: 'AI service request timed out' },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    return new HttpException(
      { message: 'Failed to communicate with AI service' },
      HttpStatus.BAD_GATEWAY,
    );
  }
}
