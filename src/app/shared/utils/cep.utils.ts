export function maskCep(input: string): string {
  let value = input.replace(/\D/g, '');

  if (value.length > 8) value = value.slice(0, 8);

  value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');

  return value;
}