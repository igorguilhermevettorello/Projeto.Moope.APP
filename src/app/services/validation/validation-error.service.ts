import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { ValidationError } from '../../core/interfaces/validation-error.interface';

@Injectable({
  providedIn: 'root'
})
export class ValidationErrorService {

  /**
   * Aplica erros de validação nos FormControls correspondentes
   * @param formGroups Array de FormGroups para aplicar os erros
   * @param errors Array de erros de validação
   * @returns Mensagem geral (campo "Mensagem") se existir
   */
  aplicarErrosDeValidacao(formGroups: FormGroup[], errors: ValidationError[]): string | null {
    let mensagemGeral: string | null = null;

    // Primeiro, limpa todos os erros de validação customizados
    this.limparErrosCustomizados(formGroups);

    // Processa cada erro
    errors.forEach(error => {
      if (error.campo === 'Mensagem') {
        mensagemGeral = error.mensagem;
      } else {
        // Aplica erro no FormControl correspondente
        this.aplicarErroNoCampo(formGroups, error.campo, error.mensagem);
      }
    });

    return mensagemGeral;
  }

  /**
   * Aplica um erro específico em um campo
   */
  private aplicarErroNoCampo(formGroups: FormGroup[], nomeCampo: string, mensagem: string): void {
    // Mapeia o nome do campo do servidor para o nome do FormControl
    const nomeCampoMapeado = this.mapearNomeCampo(nomeCampo);

    console.log('Nome do campo mapeado:', formGroups);

    for (const formGroup of formGroups) {
      const control = formGroup.get(nomeCampoMapeado);
      if (control) {
        // Adiciona o erro customizado
        control.setErrors({ 
          ...control.errors, 
          serverError: mensagem 
        });
        control.markAsTouched();
        break; // Para no primeiro FormGroup que contém o campo
      }
    }
  }

  /**
   * Mapeia nomes de campos do servidor para nomes de FormControls
   */
  private mapearNomeCampo(nomeCampoServidor: string): string {
    const mapeamento: { [key: string]: string } = {
      'CpfCnpj': 'cpfCnpj',
      'NomeCliente': 'nome',
      'Email': 'email',
      'Telefone': 'telefone',
      'NomeCartao': 'nomeCartao',
      'NumeroCartao': 'numeroCartao',
      'Cvv': 'cvv',
      'DataValidade': 'validade',
      'PlanoId': 'planoId',
      'Quantidade': 'quantidade'
    };

    return mapeamento[nomeCampoServidor] || nomeCampoServidor.toLowerCase();
  }

  /**
   * Limpa todos os erros customizados (serverError) dos FormControls
   */
  private limparErrosCustomizados(formGroups: FormGroup[]): void {
    formGroups.forEach(formGroup => {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control && control.errors && control.errors['serverError']) {
          const { serverError, ...otherErrors } = control.errors;
          control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        }
      });
    });
  }

  /**
   * Limpa erros de um campo específico quando o usuário começa a digitar
   */
  limparErroDoCampo(formGroups: FormGroup[], nomeCampo: string): void {
    for (const formGroup of formGroups) {
      const control = formGroup.get(nomeCampo);
      if (control && control.errors && control.errors['serverError']) {
        const { serverError, ...otherErrors } = control.errors;
        control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
        break;
      }
    }
  }

  /**
   * Verifica se um campo tem erro de servidor
   */
  temErroServidor(control: AbstractControl | null): boolean {
    return control ? !!(control.errors && control.errors['serverError']) : false;
  }

  /**
   * Obtém a mensagem de erro do servidor
   */
  obterMensagemErroServidor(control: AbstractControl | null): string {
    return control && control.errors && control.errors['serverError'] 
      ? control.errors['serverError'] 
      : '';
  }
}
