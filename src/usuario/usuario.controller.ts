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
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/crear')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUsuarioDto: UsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @Post('/agregarRuta')
  @UseGuards(JwtAuthGuard)
  async agregarRuta(@Body() agregarRutaCobrador: AgregarRutaDto) {
    return await this.usuarioService.agregarRuta(agregarRutaCobrador);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.usuarioService.findAll();
  }
  @Get('/roles')
  @UseGuards(JwtAuthGuard)
  getRoles() {
    return this.usuarioService.getRoles();
  }

  @Get('/cobrador')
  @UseGuards(JwtAuthGuard)
  async getCobradores() {
    return await this.usuarioService.getCobradores();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuarioService.update(updateUsuarioDto);
  }
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.usuarioService.remove(id);
  }
}
