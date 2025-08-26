export function maskFone(input: string): string {
  let value = input.replace(/\D/g, '');

  if (value.length > 11) value = value.slice(0, 11);

  // Aplica a máscara conforme o número de dígitos
  if (value.length <= 10) {
    // Formato fixo: (99) 9999-9999
    value = value.replace(/^(\d{2})(\d{0,4})(\d{0,4})/, function(_, ddd, parte1, parte2) {
      return `(${ddd}) ${parte1}${parte2 ? '-' + parte2 : ''}`;
    });
  } else {
    // Formato celular: (99) 99999-9999
    value = value.replace(/^(\d{2})(\d{0,5})(\d{0,4})/, function(_, ddd, parte1, parte2) {
      return `(${ddd}) ${parte1}${parte2 ? '-' + parte2 : ''}`;
    });
  }

  return value;
}