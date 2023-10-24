import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-strategy.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from 'src/usuario/schema/usuario.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @Inject(JwtService) private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<Usuario | { access_token: string }> {
    const { usuario } = payload;
    const userBd = await this.usuarioModel.find({
      usuario: usuario,
    });
    if (userBd.length == 0) {
      throw new UnauthorizedException('El usuario no esta registrado');
    }
    const payloadZ = {
      sub: userBd[0].id,
      usuario: userBd[0].usuario,
    };
    return {
      ...userBd,
      access_token: await this.jwtService.signAsync(payloadZ),
    };
  }

  async loginJwt(payload: JwtPayload): Promise<any> {
    const { usuario, contrasena } = payload;

    const userBd = await this.usuarioModel.find({
      usuario: usuario,
    });
    if (userBd.length == 0) {
      throw new UnauthorizedException('El usuario no esta registrado');
    } else if (!bcrypt.compareSync(contrasena, userBd[0].contrasena)) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }
    const payloadZ = {
      sub: userBd[0].id,
      usuario: userBd[0].usuario,
    };
    userBd[0].contrasena = null;
    const userReturn = {
      id: userBd[0].id,
      nombre: userBd[0].nombre,
      usuario: userBd[0].usuario,
      rol: userBd[0].rol,
      access_token: await this.jwtService.signAsync(payloadZ),
    };
    return userReturn;
  }
}
