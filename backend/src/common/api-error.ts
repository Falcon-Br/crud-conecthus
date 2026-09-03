import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorRequestHandler, Response } from 'express';
import { QueryFailedError } from 'typeorm';

export class ApiErrorDto {
  @ApiProperty({ example: 400 }) statusCode!: number;
  @ApiProperty({ example: 'VALIDATION_ERROR' }) code!: string;
  @ApiProperty({ example: 'Confira os campos informados.' }) message!: string;
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: { email: ['Informe um email válido.'] },
  })
  errors?: Record<string, string[]>;
}

export function requestValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: { target: false, value: false },
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Confira os campos informados.',
        errors: Object.fromEntries(
          errors.map((error) => [error.property, Object.values(error.constraints ?? {})]),
        ),
      }),
  });
}

function bodyParserErrorType(exception: unknown): string | undefined {
  if (typeof exception !== 'object' || exception === null) return undefined;
  const type = (exception as { type?: unknown }).type;
  return typeof type === 'string' ? type : undefined;
}

export const bodyParserErrorHandler: ErrorRequestHandler = (
  exception,
  _request,
  response,
  next,
) => {
  if (bodyParserErrorType(exception) === 'entity.parse.failed') {
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'MALFORMED_JSON',
      message: 'O corpo da requisição contém JSON inválido.',
    });
    return;
  }
  if (bodyParserErrorType(exception) === 'entity.too.large') {
    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'O corpo da requisição excede o limite permitido.',
    });
    return;
  }
  next(exception);
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof QueryFailedError) {
      const driver = exception.driverError as { code?: string; constraint?: string };
      if (driver.code === '23505') {
        const field =
          driver.constraint === 'uq_users_email'
            ? 'email'
            : driver.constraint === 'uq_users_registration'
              ? 'registration'
              : undefined;
        const message =
          field === 'email'
            ? 'Este email já está cadastrado.'
            : field === 'registration'
              ? 'Esta matrícula já está cadastrada.'
              : 'Este registro já existe.';
        response.status(409).json({
          statusCode: 409,
          code: 'DUPLICATE_USER',
          message,
          ...(field ? { errors: { [field]: [message] } } : {}),
        });
        return;
      }
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string'
          ? { message: body }
          : (body as {
              message?: string | string[];
              code?: string;
              errors?: Record<string, string[]>;
            });
      response.status(status).json({
        statusCode: status,
        code: payload.code ?? HttpStatus[status] ?? 'HTTP_ERROR',
        message:
          typeof payload.message === 'string' ? payload.message : 'Confira os dados informados.',
        ...(payload.errors ? { errors: payload.errors } : {}),
      });
      return;
    }
    // Do not log SQL, request payloads, connection strings or password material.
    this.logger.error(
      `Falha interna: ${exception instanceof Error ? exception.name : 'UnknownError'}`,
    );
    response.status(500).json({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível concluir a operação. Tente novamente.',
    });
  }
}
