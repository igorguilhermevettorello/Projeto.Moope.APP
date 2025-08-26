export interface Representante {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: 'PF' | 'PJ';
  cpfCnpj: string;
  celular: string;
  
  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
  
  // Dados de Acesso
  senha: string;
  
  // Status
  status: boolean;
}

export interface CreateRepresentanteRequest {
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: 'PF' | 'PJ';
  cpfCnpj: string;
  celular: string;
  
  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
  
  // Dados de Acesso
  senha: string;
}

export interface UpdateRepresentanteRequest {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: 'PF' | 'PJ';
  cpfCnpj: string;
  celular: string;
  
  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
  
  // Status
  status: boolean;
}