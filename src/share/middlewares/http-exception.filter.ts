import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import * as exc from '../exception';
import { ErrorCode } from '../constants/errors.constant';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // constructor(private readonly loggingService: LoggingService) {}
  // private logger = this.loggingService.getLogger('http-exception');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // const status = exception.getStatus();
    let excResponse = exception.getResponse();
    if (
      typeof excResponse !== 'object' ||
      !excResponse.hasOwnProperty('success')
    ) {
      let newDataResponse: Record<string, any> =
        typeof excResponse === 'object'
          ? excResponse
          : { message: excResponse };
      newDataResponse = newDataResponse?.message;
      excResponse = new exc.Exception({
        errorCode: ErrorCode.Other,
        data: newDataResponse,
      }).getResponse();
    }
    response.json(excResponse);
    // this.logger.debug(exception.getStatus(), excResponse);
  }
}
