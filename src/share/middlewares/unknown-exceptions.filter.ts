import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { IResponse } from '../inteceptors/response.interceptor';
import { ErrorCode } from '../constants/errors.constant';

// import { LoggingService } from 'src/shares/logging';

@Catch()
export class UnknownExceptionsFilter implements ExceptionFilter {
  // constructor() {}
  // logger = this.loggingService.getLogger('unknown-exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // this.logger.error(exception);
    console.error(exception);
    const defaultResponse: IResponse<any> = {
      errorCode: ErrorCode.Internal,
      message: '',
      success: false,
    };
    response.status(200).json(defaultResponse);
  }
}
