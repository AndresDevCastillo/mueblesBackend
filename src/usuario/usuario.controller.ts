import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from './dto/usuario.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/crear')
  async create(@Body() createUsuarioDto: UsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

@Get()
async findAll(){
  return await this.usuarioService.findAll();
}
  @Get('/roles')
  getRoles() {
    return this.usuarioService.getRoles();
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.usuarioService.remove(id);
  }
}
