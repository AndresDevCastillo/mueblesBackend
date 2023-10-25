import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateObjectidPipe implements PipeTransform {
  transform(value: string) {
    const isValid = ObjectId.isValid(value);

    if (!isValid) {
      throw new BadRequestException(
        'El valor recibido no es un ObjectId válido',
      );
    }

    return value;
  }
}
