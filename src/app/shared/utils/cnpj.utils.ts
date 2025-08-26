export function maskCnpj(input: string): string {
  let value = input.replace(/\D/g, '');

  if (value.length > 14) value = value.slice(0, 14);

  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');

  return value;
}

export function validatorCnpj(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const validarDigito = (cnpj: string, pesos: number[]): number => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) {
      soma += parseInt(cnpj[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const digito1 = validarDigito(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (digito1 !== parseInt(cnpj[12])) return false;

  const digito2 = validarDigito(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (digito2 !== parseInt(cnpj[13])) return false;

  return true;
}