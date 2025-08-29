export interface ProcessarVendaRequest {
  NomeCliente: string;
  Email: string;
  Telefone: string;
  TipoPessoa: number;
  CpfCnpj: string;
  VendedorId: string | null;
  PlanoId: string | null;
  Quantidade: number;
  NomeCartao: string;
  NumeroCartao: string;
  Cvv: string;
  DataValidade: string;
}

export interface ProcessarVendaResponse {
  sucesso: boolean;
  mensagem: string;
  vendaId?: string;
  transacaoId?: string;
}
