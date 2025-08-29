export interface ValidationError {
  campo: string;
  mensagem: string;
}

export interface ValidationErrorResponse {
  errors: ValidationError[];
}