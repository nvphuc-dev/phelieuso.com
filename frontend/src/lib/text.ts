/** Chuẩn hoá chuỗi tiếng Việt: bỏ dấu, chữ thường */
export function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

/** Kiểm tra chuỗi a có chứa b không (không phân biệt dấu, hoa/thường) */
export function includesNorm(a: string, b: string): boolean {
  return normalize(a).includes(normalize(b));
}

/** Trích xuất thông báo lỗi từ response API (422 validation hoặc message) */
export function extractApiError(err: unknown): string {
  const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })
    ?.response?.data;
  if (data?.errors) {
    const firstField = Object.values(data.errors).flat()[0];
    if (firstField) return firstField;
  }
  return data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.';
}
