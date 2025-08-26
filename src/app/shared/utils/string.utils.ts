export function lowerFirst(str: string): string {
  if (!str) return '';
  return str[0].toLowerCase() + str.slice(1);
}