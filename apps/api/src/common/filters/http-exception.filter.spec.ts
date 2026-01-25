import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionFilter, ErrorResponse } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockRequest: {
    url: string;
    method: string;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle simple string message exception', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          error: 'Bad Request',
          path: '/api/v1/test',
          method: 'GET',
        }),
      );
    });

    it('should handle BadRequestException', () => {
      const exception = new BadRequestException('Invalid input');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid input',
          error: 'Bad Request',
        }),
      );
    });

    it('should handle UnauthorizedException', () => {
      const exception = new UnauthorizedException('Invalid credentials');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials',
          error: 'Unauthorized',
        }),
      );
    });

    it('should handle ForbiddenException', () => {
      const exception = new ForbiddenException('Access denied');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access denied',
          error: 'Forbidden',
        }),
      );
    });

    it('should handle NotFoundException', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
        }),
      );
    });

    it('should handle InternalServerErrorException', () => {
      const exception = new InternalServerErrorException('Server error');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new BadRequestException('Test');
      const before = new Date().toISOString();

      filter.catch(exception, mockHost);

      const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
      const after = new Date().toISOString();

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
      expect(new Date(response.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime(),
      );
    });

    it('should include correct path and method', () => {
      mockRequest.url = '/api/v1/projects/123';
      mockRequest.method = 'DELETE';
      const exception = new NotFoundException('Project not found');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/projects/123',
          method: 'DELETE',
        }),
      );
    });

    describe('validation errors', () => {
      it('should handle validation errors with message array', () => {
        const exception = new BadRequestException({
          message: [
            'email must be a valid email',
            'password must be at least 8 characters',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('email must be a valid email');
        expect(response.details).toEqual([
          'email must be a valid email',
          'password must be at least 8 characters',
        ]);
      });

      it('should handle single validation error in array', () => {
        const exception = new BadRequestException({
          message: ['email must be a valid email'],
          error: 'Bad Request',
          statusCode: 400,
        });

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('email must be a valid email');
        expect(response.details).toBeUndefined();
      });

      it('should handle empty message array', () => {
        const exception = new BadRequestException({
          message: [],
          error: 'Bad Request',
          statusCode: 400,
        });

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('Validation failed');
      });

      it('should handle custom details object', () => {
        const exception = new BadRequestException({
          message: 'Validation failed',
          details: { email: 'Invalid format', password: 'Too short' },
        });

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('Validation failed');
        expect(response.details).toEqual({
          email: 'Invalid format',
          password: 'Too short',
        });
      });
    });

    describe('error name mapping', () => {
      const testCases: [number, string][] = [
        [HttpStatus.BAD_REQUEST, 'Bad Request'],
        [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
        [HttpStatus.FORBIDDEN, 'Forbidden'],
        [HttpStatus.NOT_FOUND, 'Not Found'],
        [HttpStatus.METHOD_NOT_ALLOWED, 'Method Not Allowed'],
        [HttpStatus.CONFLICT, 'Conflict'],
        [HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity'],
        [HttpStatus.TOO_MANY_REQUESTS, 'Too Many Requests'],
        [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
        [HttpStatus.BAD_GATEWAY, 'Bad Gateway'],
        [HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable'],
        [HttpStatus.GATEWAY_TIMEOUT, 'Gateway Timeout'],
      ];

      testCases.forEach(([status, expectedError]) => {
        it(`should return "${expectedError}" for status ${status}`, () => {
          const exception = new HttpException('Test', status);

          filter.catch(exception, mockHost);

          expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
              error: expectedError,
            }),
          );
        });
      });

      it('should return "Error" for unknown status codes', () => {
        const exception = new HttpException('Test', 418);

        filter.catch(exception, mockHost);

        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Error',
          }),
        );
      });
    });

    describe('edge cases', () => {
      it('should handle exception with object response without message', () => {
        const exception = new HttpException(
          { error: 'Custom Error' },
          HttpStatus.BAD_REQUEST,
        );

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('An error occurred');
      });

      it('should handle exception with null-like values gracefully', () => {
        const exception = new HttpException(
          { message: null },
          HttpStatus.BAD_REQUEST,
        );

        filter.catch(exception, mockHost);

        const response = mockResponse.json.mock.calls[0][0] as ErrorResponse;
        expect(response.message).toBe('An error occurred');
      });
    });
  });
});
