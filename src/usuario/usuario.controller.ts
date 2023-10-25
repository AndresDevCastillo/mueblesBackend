import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from './dto/usuario.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/crear')
  async create(@Body() createUsuarioDto: UsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.usuarioService.remove(id);
  }
}
