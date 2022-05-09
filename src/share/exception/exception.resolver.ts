import { HttpException, HttpStatus } from '@nestjs/common';
import {
  defaultResponse,
  IResponse,
} from '../inteceptors/response.interceptor';
import { ErrorCode } from '../constants/errors.constant';

export abstract class BaseException<TData> extends HttpException {
  protected constructor(partial: IResponse<TData>, statusCode: number) {
    const payload = {
      ...defaultResponse,
      errorCode: ErrorCode.Default,
      ...partial,
    };
    payload.success =
      payload.errorCode === ErrorCode.NoError && payload.message === '';
    super(payload, statusCode);
  }
}

/**
 * response to client an error
 * @example
 * throw new exc.Exception<number>({
    message: 'Not found user id',
  });
 */
export class BusinessException<TData> extends BaseException<TData> {
  constructor(
    payload: IResponse<TData>,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(payload, statusCode);
  }
}

export class Exception<TData> extends BaseException<TData> {
  constructor(payload: IResponse<TData>) {
    super(payload, HttpStatus.OK);
  }
}
