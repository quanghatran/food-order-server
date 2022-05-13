import {
  ApiOperation,
  ApiOperationOptions,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';
export * from '@nestjs/swagger';

export function enumToObj(
  enumVariable: Record<string, any>,
): Record<string, any> {
  const enumValues = Object.values(enumVariable);
  const hLen = enumValues.length / 2;
  const object = {};
  for (let i = 0; i < hLen; i++) {
    object[enumValues[i]] = enumValues[hLen + i];
  }
  return object;
}

export function enumProperty(options: ApiPropertyOptions): ApiPropertyOptions {
  const obj = enumToObj(options.enum);
  const enumValues = Object.values(obj);
  return {
    example: enumValues[0],
    ...options,
    enum: enumValues,
    description: (options.description ?? '') + ': ' + JSON.stringify(obj),
  };
}

const createApiOperation = (defaultOptions: ApiOperationOptions) => {
  return (options?: ApiOperationOptions): MethodDecorator =>
    ApiOperation({
      ...defaultOptions,
      ...options,
    });
};

export const ApiEnumProperty = (options: ApiPropertyOptions) =>
  ApiProperty(enumProperty(options));

export const ApiListOperation = createApiOperation({
  summary: 'List all',
});
export const ApiRetrieveOperation = createApiOperation({
  summary: 'Get data 1 record',
});
export const ApiCreateOperation = createApiOperation({
  summary: 'Create new record',
});
export const ApiUpdateOperation = createApiOperation({
  summary: 'Edit record',
});
export const ApiDeleteOperation = createApiOperation({
  summary: 'Delete record',
});
export const ApiBulkDeleteOperation = createApiOperation({
  summary: 'Delete many record',
});
