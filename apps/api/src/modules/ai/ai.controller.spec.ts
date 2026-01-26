import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import {
  GenerateTestsDto,
  GenerateTestsResponseDto,
  GenerateBddDto,
  GenerateBddResponseDto,
} from './dto';

describe('AiController', () => {
  let controller: AiController;

  const mockAiService = {
    generateTests: jest.fn(),
    generateBdd: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateTests', () => {
    const mockRequest: GenerateTestsDto = {
      description: 'User should be able to login with email and password',
      context: 'Web application with JWT authentication',
      test_type: 'all',
      max_tests: 5,
      priority: 'high',
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
        {
          title: 'Login with invalid password',
          steps: [
            {
              step_number: 1,
              action: 'Navigate to login page',
              expected_result: 'Login page is displayed',
            },
            {
              step_number: 2,
              action: 'Enter valid email and invalid password',
              expected_result: 'Credentials are entered',
            },
            {
              step_number: 3,
              action: 'Click login button',
              expected_result: 'Error message is displayed',
            },
          ],
          expected_result: 'Login fails with error message',
          priority: 'high',
          test_type: 'negative',
        },
      ],
      metadata: {
        provider: 'openai',
        model: 'gpt-4',
        tokens_used: 1500,
      },
    };

    it('should call aiService.generateTests with the request', async () => {
      mockAiService.generateTests.mockResolvedValue(mockResponse);

      const result = await controller.generateTests(mockRequest);

      expect(mockAiService.generateTests).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should return generated test cases', async () => {
      mockAiService.generateTests.mockResolvedValue(mockResponse);

      const result = await controller.generateTests(mockRequest);

      expect(result.test_cases).toHaveLength(2);
      expect(result.test_cases[0]!.title).toBe('Login with valid credentials');
      expect(result.metadata).toHaveProperty('provider', 'openai');
    });

    it('should propagate errors from aiService', async () => {
      const error = new Error('AI service error');
      mockAiService.generateTests.mockRejectedValue(error);

      await expect(controller.generateTests(mockRequest)).rejects.toThrow(error);
    });

    it('should handle request with minimal required fields', async () => {
      const minimalRequest: GenerateTestsDto = {
        description: 'User should be able to logout',
      };

      const minimalResponse: GenerateTestsResponseDto = {
        test_cases: [],
        metadata: {},
      };

      mockAiService.generateTests.mockResolvedValue(minimalResponse);

      const result = await controller.generateTests(minimalRequest);

      expect(mockAiService.generateTests).toHaveBeenCalledWith(minimalRequest);
      expect(result).toEqual(minimalResponse);
    });
  });

  describe('generateBdd', () => {
    const mockRequest: GenerateBddDto = {
      feature_description:
        'As a user, I want to reset my password so that I can regain access to my account',
      context: 'Password reset requires email verification',
      max_scenarios: 3,
      include_examples: true,
    };

    const mockResponse: GenerateBddResponseDto = {
      feature_name: 'Password Reset',
      feature_description: 'Allow users to reset their password via email',
      scenarios: [
        {
          name: 'Successful password reset',
          given: [
            'the user has a registered account',
            'the user is on the login page',
          ],
          when: [
            'the user clicks "Forgot Password"',
            'the user enters their email',
            'the user clicks "Send Reset Link"',
          ],
          then: [
            'a password reset email is sent',
            'the user sees a confirmation message',
          ],
          tags: ['@smoke', '@auth'],
        },
        {
          name: 'Reset password with invalid email',
          given: ['the user is on the forgot password page'],
          when: ['the user enters an unregistered email', 'the user clicks "Send Reset Link"'],
          then: ['an error message is displayed'],
          tags: ['@negative'],
        },
      ],
      gherkin: `Feature: Password Reset
  As a user
  I want to reset my password
  So that I can regain access to my account

  @smoke @auth
  Scenario: Successful password reset
    Given the user has a registered account
    And the user is on the login page
    When the user clicks "Forgot Password"
    And the user enters their email
    And the user clicks "Send Reset Link"
    Then a password reset email is sent
    And the user sees a confirmation message`,
      metadata: {
        provider: 'anthropic',
        model: 'claude-3',
        tokens_used: 1200,
      },
    };

    it('should call aiService.generateBdd with the request', async () => {
      mockAiService.generateBdd.mockResolvedValue(mockResponse);

      const result = await controller.generateBdd(mockRequest);

      expect(mockAiService.generateBdd).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should return generated BDD scenarios', async () => {
      mockAiService.generateBdd.mockResolvedValue(mockResponse);

      const result = await controller.generateBdd(mockRequest);

      expect(result.feature_name).toBe('Password Reset');
      expect(result.scenarios).toHaveLength(2);
      expect(result.scenarios[0]!.name).toBe('Successful password reset');
      expect(result.gherkin).toContain('Feature: Password Reset');
    });

    it('should propagate errors from aiService', async () => {
      const error = new Error('AI service error');
      mockAiService.generateBdd.mockRejectedValue(error);

      await expect(controller.generateBdd(mockRequest)).rejects.toThrow(error);
    });

    it('should handle request with minimal required fields', async () => {
      const minimalRequest: GenerateBddDto = {
        feature_description:
          'As a user, I want to view my profile information',
      };

      const minimalResponse: GenerateBddResponseDto = {
        feature_name: 'Profile View',
        feature_description: 'View user profile information',
        scenarios: [],
        gherkin: 'Feature: Profile View',
        metadata: {},
      };

      mockAiService.generateBdd.mockResolvedValue(minimalResponse);

      const result = await controller.generateBdd(minimalRequest);

      expect(mockAiService.generateBdd).toHaveBeenCalledWith(minimalRequest);
      expect(result).toEqual(minimalResponse);
    });

    it('should handle scenarios with examples', async () => {
      const responseWithExamples: GenerateBddResponseDto = {
        ...mockResponse,
        scenarios: [
          {
            name: 'Login with different credentials',
            given: ['the user is on the login page'],
            when: ['the user enters "<email>" and "<password>"'],
            then: ['the user should see "<result>"'],
            examples: [
              { email: 'valid@example.com', password: 'valid123', result: 'dashboard' },
              { email: 'invalid@example.com', password: 'wrong', result: 'error message' },
            ],
            tags: ['@data-driven'],
          },
        ],
      };

      mockAiService.generateBdd.mockResolvedValue(responseWithExamples);

      const result = await controller.generateBdd(mockRequest);

      expect(result.scenarios[0]!.examples).toHaveLength(2);
    });
  });
});
