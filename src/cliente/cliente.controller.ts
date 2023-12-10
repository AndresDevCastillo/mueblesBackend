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
  Request,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('cliente')
@UseGuards(JwtAuthGuard)
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post('/crear')
  async create(@Body() createClienteDto: CreateClienteDto) {
    return await this.clienteService.create(createClienteDto);
  }

  @Post('/subir')
  @UseInterceptors(
    FileInterceptor('excel', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}.${
              file.originalname.split('.')[1]
            }`,
          );
        },
      }),
    }),
  )
  async subirClientes(@UploadedFile() excel: Express.Multer.File, @Request() {user}) {
    return await this.clienteService.subirClientes(excel, user[0].nombre);
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
