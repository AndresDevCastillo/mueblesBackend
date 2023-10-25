import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post('/crear')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createClienteDto: CreateClienteDto) {
    return await this.clienteService.create(createClienteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.clienteService.findAll();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.findOne(id);
  }

  @Put('/actualizar')
  @UseGuards(JwtAuthGuard)
  update(@Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(updateClienteDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.remove(id);
  }
}
