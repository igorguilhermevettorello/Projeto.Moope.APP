export interface Cliente {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  tipoPessoa: number;
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

export interface CreateClienteRequest {
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

export interface UpdateClienteRequest {
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

export interface EnderecoDto {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface CreateClienteDto {
  id: string;
  nome: string;
  email: string;
  cpfCnpj: string;
  celular: string;
  tipoPessoa: number;
  ativo: boolean;
  endereco: EnderecoDto;
  senha: string;
  confirmacao: string;
}