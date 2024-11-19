export interface ResponseStructure {
  success: boolean;
  code: number;
  data: any;
  error: {
    message: string;
    details: any;
  } | null;
  meta: {
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  } | null;
}

export function createResponse(
  success: boolean,
  code: number,
  data: any,
  error: { message: string; details: any } | null = null,
  meta: {
    pagination?: { total: number; page: number; limit: number };
  } | null = null,
): ResponseStructure {
  return {
    success,
    code,
    data,
    error,
    meta,
  };
}
