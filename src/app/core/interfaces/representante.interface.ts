export interface Representante {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: number;
  cpfCnpj: string;
  telefone: string;
  ativo: boolean;
  
  // Endereço
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  
  // Dados da Conta
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  percentualComissao: number;
  chavePix: string;
  status: boolean;
}

export interface RepresentanteDetalhado {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: number;
  cpfCnpj: string;
  telefone: string;
  ativo: boolean;
  
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;

  // Dados da Conta
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  percentualComissao: number;
  chavePix: string;
}

export interface CreateRepresentanteRequest {
  // Dados Pessoais
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  tipoPessoa: number;
  ativo: boolean;
  
  // Endereço
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  
  // Dados de Acesso
  senha: string;
  confirmacao: string;
  
  // Dados da Conta
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  percentualComissao: number;
  chavePix: string;
}

export interface UpdateRepresentanteRequest {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  tipoPessoa: number;
  ativo: boolean;
  
  // Endereço
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  
  // Dados da Conta
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  percentualComissao: number;
  chavePix: string;
}

export interface ListaRepresentante {
  id: string;
  nome: string;
  email: string;
  tipoPessoa: number;
  cpfCnpj: string;
  telefone: string;
  cidade: string;
  estado: string;
  ativo: boolean;
}