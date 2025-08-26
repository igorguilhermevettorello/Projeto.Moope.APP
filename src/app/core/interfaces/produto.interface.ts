export interface Produto {
  id?: number;
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  status: boolean;
  categoriaId?: number;
  categoria?: string;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
}

export interface ProdutoRequest {
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  status: boolean;
  categoriaId?: number;
}

export interface ProdutoResponse {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  status: boolean;
  categoriaId?: number;
  categoria?: string;
  dataCadastro: Date;
  dataAtualizacao: Date;
} 