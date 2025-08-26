export function maskCpf(input: string): string {
  let value = input.replace(/\D/g, ''); 

  if (value.length > 11) value = value.slice(0, 11); 

  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  return value;
}

export function validatorCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; 

  if (cpf === '00000000000' || cpf === '11111111111' || cpf === '22222222222' ||
    cpf === '33333333333' || cpf === '44444444444' || cpf === '55555555555' ||
    cpf === '66666666666' || cpf === '77777777777' || cpf === '88888888888' ||
    cpf === '99999999999') {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

