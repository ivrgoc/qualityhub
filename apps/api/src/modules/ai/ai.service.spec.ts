import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosHeaders } from 'axios';
import { AiService } from './ai.service';
import {
  GenerateTestsDto,
  GenerateTestsResponseDto,
  GenerateBddDto,
  GenerateBddResponseDto,
} from './dto';

describe('AiService', () => {
  let service: AiService;

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTests', () => {
    const mockRequest: GenerateTestsDto = {
      description: 'User should be able to login with email and password',
      context: 'Web application',
      test_type: 'all',
      max_tests: 5,
    };

    const mockResponse: GenerateTestsResponseDto = {
      test_cases: [
        {
          title: 'Login with valid credentials',
          preconditions: 'User has a registered account',
          steps: [
            {
              step_number: 1,
              action: 'Navigate to login page',
              expected_result: 'Login page is displayed',
            },
            {
              step_number: 2,
              action: 'Enter valid email and password',
              expected_result: 'Credentials are entered',
            },
            {
              step_number: 3,
              action: 'Click login button',
              expected_result: 'User is logged in and redirected to dashboard',
            },
          ],
          expected_result: 'User successfully logs in',
          priority: 'high',
          test_type: 'functional',
        },
      ],
      metadata: {
        provider: 'openai',
        model: 'gpt-4',
        tokens_used: 1500,
      },
    };

    it('should generate test cases successfully', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.generateTests(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/generate/tests',
        mockRequest,
      );
    });

    it('should throw HttpException on AI service error', async () => {
      const axiosError = new AxiosError('AI service error');
      axiosError.response = {
        status: 500,
        data: { detail: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateTests(mockRequest)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw SERVICE_UNAVAILABLE when connection is refused', async () => {
      const axiosError = new AxiosError('Connection refused');
      axiosError.code = 'ECONNREFUSED';

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateTests(mockRequest)).rejects.toThrow(
        new HttpException(
          { message: 'AI service is unavailable' },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should throw GATEWAY_TIMEOUT on timeout', async () => {
      const axiosError = new AxiosError('Timeout');
      axiosError.code = 'ETIMEDOUT';

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateTests(mockRequest)).rejects.toThrow(
        new HttpException(
          { message: 'AI service request timed out' },
          HttpStatus.GATEWAY_TIMEOUT,
        ),
      );
    });

    it('should throw BAD_REQUEST on validation error (422)', async () => {
      const axiosError = new AxiosError('Validation error');
      axiosError.response = {
        status: 422,
        data: { detail: 'Validation error' },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateTests(mockRequest)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.generateTests(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('generateBdd', () => {
    const mockRequest: GenerateBddDto = {
      feature_description:
        'As a user, I want to reset my password so that I can regain access',
      context: 'Email verification required',
      max_scenarios: 3,
      include_examples: true,
    };

    const mockResponse: GenerateBddResponseDto = {
      feature_name: 'Password Reset',
      feature_description: 'Allow users to reset their password via email',
      scenarios: [
        {
          name: 'Successful password reset',
          given: ['the user has a registered account', 'the user is on the login page'],
          when: ['the user clicks "Forgot Password"', 'the user enters their email'],
          then: ['a password reset email is sent', 'the user sees a confirmation message'],
          tags: ['@smoke', '@auth'],
        },
      ],
      gherkin:
        'Feature: Password Reset\n  Scenario: Successful password reset\n    Given the user has a registered account',
      metadata: {
        provider: 'openai',
        model: 'gpt-4',
        tokens_used: 1200,
      },
    };

    it('should generate BDD scenarios successfully', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.generateBdd(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/generate/bdd',
        mockRequest,
      );
    });

    it('should throw HttpException on AI service error', async () => {
      const axiosError = new AxiosError('AI service error');
      axiosError.response = {
        status: 500,
        data: { detail: 'Failed to generate BDD scenarios' },
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateBdd(mockRequest)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw SERVICE_UNAVAILABLE when connection is refused', async () => {
      const axiosError = new AxiosError('Connection refused');
      axiosError.code = 'ECONNREFUSED';

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateBdd(mockRequest)).rejects.toThrow(
        new HttpException(
          { message: 'AI service is unavailable' },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should handle ECONNABORTED error as timeout', async () => {
      const axiosError = new AxiosError('Connection aborted');
      axiosError.code = 'ECONNABORTED';

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.generateBdd(mockRequest)).rejects.toThrow(
        new HttpException(
          { message: 'AI service request timed out' },
          HttpStatus.GATEWAY_TIMEOUT,
        ),
      );
    });
  });

  describe('handleAiServiceError', () => {
    it('should return BAD_GATEWAY for unknown errors', async () => {
      const axiosError = new AxiosError('Unknown error');

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      const mockRequest: GenerateTestsDto = {
        description: 'Test description that is long enough',
      };

      await expect(service.generateTests(mockRequest)).rejects.toThrow(
        new HttpException(
          { message: 'Failed to communicate with AI service' },
          HttpStatus.BAD_GATEWAY,
        ),
      );
    });

    it('should preserve status code for client errors (4xx)', async () => {
      const axiosError = new AxiosError('Bad request');
      axiosError.response = {
        status: 400,
        data: { detail: 'Bad request' },
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      const mockRequest: GenerateTestsDto = {
        description: 'Test description that is long enough',
      };

      try {
        await service.generateTests(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(400);
      }
    });
  });
});
