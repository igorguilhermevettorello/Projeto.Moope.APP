export interface Claim {
  value: string;
  type: string;
}

export interface Usuario {
  id: string;
  email: string;
  claims: Claim[];
  perfil: string;
}

export interface UsuarioData {
  accessToken: string;
  expiresIn: number;
  user: Usuario;
}

export interface UsuarioLogado {
  data: UsuarioData;
}

export enum PerfilUsuario {
  ADMINISTRADOR = 'administrador',
  VENDEDOR = 'vendedor',
  CLIENTE = 'cliente'
} 