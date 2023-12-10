import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto, UsuarioDto } from './dto/usuario.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { AgregarRutaDto } from './dto/agregarRuta.dto';

@Controller('usuario')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/crear')
  async create(@Body() createUsuarioDto: UsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @Post('/agregarRuta')
  async agregarRuta(@Body() agregarRutaCobrador: AgregarRutaDto) {
    return await this.usuarioService.agregarRuta(agregarRutaCobrador);
  }

  @Get()
  async findAll() {
    return await this.usuarioService.findAll();
  }
  @Get('/roles')
  getRoles() {
    return this.usuarioService.getRoles();
  }

  @Get('/cobrador')
  async getCobradores() {
    return await this.usuarioService.getCobradores();
  }

  @Put()
  async update(@Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuarioService.update(updateUsuarioDto);
  }
  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.usuarioService.remove(id);
  }
}
