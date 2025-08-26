import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lowerFirst'
})
export class LowerFirstPipe implements PipeTransform {

  transform(str: string): string {
    if (!str) return '';
    return str[0].toLowerCase() + str.slice(1);
  }
}
