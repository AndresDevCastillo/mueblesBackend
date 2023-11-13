import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cliente')
@UseGuards(JwtAuthGuard)
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post('/crear')
  async create(@Body() createClienteDto: CreateClienteDto) {
    return await this.clienteService.create(createClienteDto);
  }

  @Post('/subir')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('excel'))
  async subirClientes(@UploadedFile() excel: Express.Multer.File) {
    console.log('EXCEL: ', excel);
    return excel;
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.findOne(id);
  }

  @Get('/estadisticas/obtener')
  async estadisticas() {
    return await this.clienteService.estadisticas();
  }

  @Put('/actualizar')
  update(@Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(updateClienteDto);
  }

  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.clienteService.remove(id);
  }
}
