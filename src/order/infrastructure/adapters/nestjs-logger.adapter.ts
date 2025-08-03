import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { Logger } from '../../application/ports/logger.port';

@Injectable()
export class NestJSLoggerAdapter implements Logger {
  private readonly logger = new NestLogger();

  log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }
}