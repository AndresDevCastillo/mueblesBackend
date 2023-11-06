import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateInventarioDto, UpdateInventarioDto } from './dto/inventario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventario } from './schema/inventario.schema';
import { ProductoService } from 'src/producto/producto.service';

@Injectable()
export class InventarioService {
  constructor(@InjectModel(Inventario.name) private inventarioModel: Model<Inventario>,
  @Inject(ProductoService) private readonly productoService : ProductoService
  ){}
  async create(createInventarioDto: CreateInventarioDto) {
    try {
      return await this.inventarioModel.create({
        ...createInventarioDto,
        existencias: createInventarioDto.cantidad
      });
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
    return await this.inventarioModel.find().populate('producto');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }
   async findAllExiste() {
    try {
    return await this.inventarioModel.find({existencias : {$gt: 0}}).populate('producto');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.inventarioModel.findById(id).populate('producto');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async update(updateInventarioDto: UpdateInventarioDto) {
    try {
      return await this.inventarioModel.findByIdAndUpdate(updateInventarioDto.id, {
        ...updateInventarioDto
      })
    } catch(error) {
      this.handleBDerrors(error);
    }
  }
async productosSinInventario(){
  try {
    const inventarioQuery = await this.inventarioModel.find().populate('producto');
    const inventarioId = inventarioQuery.map((invetario:any) => {
      return invetario.producto._id;
    })
    return await this.productoService.productosSinInventario(inventarioId);
  } catch(error){
    this.handleBDerrors(error);
  }
}
  async remove(id: string) {
    try {
      return await this.inventarioModel.findByIdAndDelete(id);
    } catch(error){
      this.handleBDerrors(error);
    }
  }
  private handleBDerrors(error: any, codeError = 500) {
    console.log(error);
    throw new HttpException(
      { message: error, suggest: 'Por favor revise los logs del sistema' },
      codeError,
      {
        cause: error,
      },
    );
  }
}
