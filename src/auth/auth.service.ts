import { Inject, Injectable } from '@nestjs/common';
import { UserLoginDto } from 'src/usuario/dto/usuario.dto';
import { JwtStrategy } from './strategies/jwt.strategy';
@Injectable()
export class AuthService {
  constructor(@Inject(JwtStrategy) private jwtStrategy: JwtStrategy) {}
  async signIn(userSignIn: UserLoginDto): Promise<any> {
    return await this.jwtStrategy.loginJwt({
      usuario: userSignIn.usuario,
      contrasena: userSignIn.contrasena,
    });
  }
}
