import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moedaBrasileira'
})
export class MoedaBrasileiraPipe implements PipeTransform {
  transform(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
