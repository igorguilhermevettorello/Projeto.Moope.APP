export function maskMoney(str: string): string {
  // Remove todos os caracteres que não são dígitos
  const apenasNumeros = str.replace(/\D/g, '');

  // Converte para número e divide por 100 para considerar os centavos
  const valorNumerico = parseFloat(apenasNumeros) / 100;

  // Formata para o padrão de moeda brasileira
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).replace(/^R\$\s?/, '');
}

export function moneyToFloat(valor: string): string {
  if (typeof valor !== 'string') return "0";
  
  // Remove os pontos e substitui a vírgula por ponto
  const valorConvertido = valor.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(valorConvertido).toString();
}

export function formatarParaMoedaBrasileira(valor: number): string {
  var valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);

  return valorFormatado.replace(/^R\$\s?/, '');
}