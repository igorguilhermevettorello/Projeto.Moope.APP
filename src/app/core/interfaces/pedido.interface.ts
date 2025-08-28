export interface Pedido {
  id: string;
  numero: string;
  dataPedido: string;
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  representanteId?: string;
  representanteNome?: string;
  status: StatusPedido;
  valorTotal: number;
  observacoes?: string;
  itens: ItemPedido[];
  enderecoEntrega: EnderecoEntrega;
  formaPagamento: FormaPagamento;
  dataEntrega?: string;
  dataCancelamento?: string;
  motivoCancelamento?: string;
}

export interface ItemPedido {
  id: string;
  produtoId: string;
  produtoNome: string;
  produtoDescricao?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes?: string;
}

export interface EnderecoEntrega {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pontoReferencia?: string;
}

export interface FormaPagamento {
  tipo: TipoPagamento;
  parcelas: number;
  valorParcela: number;
  dadosCartao?: DadosCartao;
  dadosPix?: DadosPix;
}

export interface DadosCartao {
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
}

export interface DadosPix {
  chavePix: string;
  qrCode?: string;
}

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  PROCESSANDO = 'PROCESSANDO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO'
}

export enum TipoPagamento {
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}

export interface ListaPedidoDto {
  id: string;
  numero: string;
  dataPedido: string;
  clienteNome: string;
  clienteEmail: string;
  representanteNome?: string;
  status: StatusPedido;
  valorTotal: number;
  cidade: string;
  estado: string;
}

export interface CreatePedidoRequest {
  clienteId: string;
  representanteId?: string;
  observacoes?: string;
  itens: Omit<ItemPedido, 'id' | 'produtoNome' | 'produtoDescricao' | 'valorTotal'>[];
  enderecoEntrega: EnderecoEntrega;
  formaPagamento: FormaPagamento;
}

export interface UpdatePedidoRequest {
  id: string;
  status: StatusPedido;
  observacoes?: string;
  dataEntrega?: string;
  motivoCancelamento?: string;
}
