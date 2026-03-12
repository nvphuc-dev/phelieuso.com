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
