import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorCode } from '../constants/errors.constant';

export const defaultResponse: IResponse<[]> = {
  success: true,
  errorCode: ErrorCode.NoError,
  message: '',
  data: [],
};

export interface IResponse<T> {
  errorCode?: ErrorCode;
  data?: T;
  metadata?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  message?: string | null;
  messageDetail?: any;
  success?: boolean;
}
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        let metadata;
        if (data?.metadata) {
          metadata = {
            ...data.metadata,
            timestamp: new Date(),
          };
          delete data.metadata;
        } else {
          metadata = {};
        }
        return {
          errorCode: ErrorCode.NoError,
          data: data?.data || data || [],
          metadata: metadata,
          success: true,
          message: '',
        };
      }),
    );
  }
}
