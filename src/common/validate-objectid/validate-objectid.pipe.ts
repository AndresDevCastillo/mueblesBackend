import { Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateObjectidPipe implements PipeTransform {
  transform(value: string) {
    const isValid = ObjectId.isValid(value);

    return isValid ? value : 'El valor recibido no es un ObjectId válido';
  }
}
