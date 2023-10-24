import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { UserLoginDto } from 'src/usuario/dto/usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() sigInDto: UserLoginDto) {
    return await this.authService.signIn(sigInDto);
  }

  @Get('/logueado')
  @UseGuards(JwtAuthGuard)
  logueado() {
    return {
      message: 'Bienvenido',
      status: 'Logueado',
    };
  }
}
