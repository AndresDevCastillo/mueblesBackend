import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post('/crear')
  async create(@Body() createClienteDto: CreateClienteDto) {
    return await this.clienteService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.findOne(id);
  }

  @Put('/actualizar')
  update(@Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update( updateClienteDto);
  }

  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.remove(id);
  }
}
