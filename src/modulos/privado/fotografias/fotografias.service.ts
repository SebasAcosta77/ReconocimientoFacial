import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Fotografias } from 'src/models/fotografias/fotografias';
import rutasImagen from '../../../utilidades/Dominios/var_imagenes';
import AdministrarImagen from '../../../utilidades/Funciones/administrarImagenes';
import { DataSource, Repository } from 'typeorm';
import ImagenVerificar from './ImagenVerificar';
import AdministrarImagenes from '../../../utilidades/Funciones/administrarImagenes';

@Injectable()
export class FotografiasService {
    private imagenRepositorio: Repository<Fotografias>;

    constructor(private poolConexion: DataSource) {
        this.imagenRepositorio = poolConexion.getRepository(Fotografias);
    }

    public async consultar(codUsuario: string): Promise<any> {
        try {
            const arrImagenes = await this.imagenRepositorio.findBy({ codUsuario });
            return ImagenVerificar.consultarBase64(arrImagenes);
        } catch (error) {
            throw new HttpException(`Fallo al consultar imágenes para codUsuario: ${codUsuario}`, HttpStatus.BAD_REQUEST);
        }
    }

    public async verificarImagen(nombre: string): Promise<boolean> {
        try {
            const existe = await this.imagenRepositorio.findBy({ nombrePublicoImagen: nombre });
            return existe.length > 0;
        } catch (error) {
            throw new HttpException(`No se pudo verificar la imagen: ${nombre}`, HttpStatus.CONFLICT);
        }
    }

    public async registrar(objImagen: Fotografias): Promise<any> {
        try {
            if (!objImagen.base64Imagen) {
                throw new HttpException('La imagen en base64 es requerida.', HttpStatus.BAD_REQUEST);
            }

            const rutaUbicacionimagen = rutasImagen.rutaFotosUsuario;
            AdministrarImagen.agregarImagen(
                objImagen.nombrePrivadoImagen,
                objImagen.base64Imagen,
                rutaUbicacionimagen
            );

            objImagen.base64Imagen = undefined;
            return await this.imagenRepositorio.save(objImagen);
        } catch (error) {
            console.error(error);
            throw new HttpException('Fallo al registrar la imagen', HttpStatus.CONFLICT);
        }
    }

    public async consultarUno(codigo: string): Promise<any> {
        try {
            const imagenes = await this.imagenRepositorio.findBy({ codUsuario: codigo });
            return ImagenVerificar.consultarBase64(imagenes);
        } catch (error) {
            throw new HttpException(`Fallo al consultar imagen para codUsuario: ${codigo}`, HttpStatus.BAD_REQUEST);
        }
    }

    public async actualizar(objImagen: Fotografias, codigo: number): Promise<any> {
        try {
            if (await this.verificarImagen(objImagen.nombrePublicoImagen)) {
                throw new HttpException('La imagen ya existe', HttpStatus.BAD_REQUEST);
            }

            const resultado = await this.imagenRepositorio.update({ codImagen: codigo }, objImagen);
            if (resultado.affected === 0) {
                throw new HttpException('Imagen no encontrada', HttpStatus.NOT_FOUND);
            }
            return { mensaje: 'Imagen actualizada', objeto: objImagen };
        } catch (error) {
            throw new HttpException(`Fallo al actualizar imagen con codImagen: ${codigo}`, HttpStatus.BAD_REQUEST);
        }
    }

    public async eliminar(codigoImg: number): Promise<any> {
        try {
            const rutaUbicacionimagen = rutasImagen.rutaFotoSistema;
            const imagenEliminar = await this.imagenRepositorio.findOne({ where: { codImagen: codigoImg } });

            if (!imagenEliminar) {
                throw new HttpException('Imagen no encontrada', HttpStatus.NOT_FOUND);
            }

            await this.imagenRepositorio.delete({ codImagen: codigoImg });
            AdministrarImagen.removerImagen(imagenEliminar.nombrePrivadoImagen, rutaUbicacionimagen);

            return { mensaje: 'Imagen eliminada correctamente' };
        } catch (error) {
            throw new HttpException(`Fallo al eliminar imagen con codImagen: ${codigoImg}`, HttpStatus.BAD_REQUEST);
        }
    }

    public async listarTodas(): Promise<any[]> {
        try {
            const imagenes = await this.imagenRepositorio.find();
            if (!imagenes.length) {
                return []; // Devuelve array vacío si no hay imágenes
            }

            // Mapear al formato esperado por el servicio en Python
            const imagenesConBase64 = await ImagenVerificar.consultarBase64(imagenes);
            return imagenesConBase64.map((img: Fotografias) => ({
                codUsuario: img.codUsuario,
                base64Imagen: img.base64Imagen || null,
                nombrePrivadoImagen: img.nombrePrivadoImagen || null,
            }));
        } catch (error) {
            console.error('Error en listarTodas:', error);
            throw new HttpException(`Error al listar imágenes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public async registrarr(fotografia: Fotografias, base64Imagen: string): Promise<Fotografias> {
        try {
            const yaRegistrado = await this.imagenRepositorio.findOne({
                where: {
                    codUsuario: fotografia.codUsuario,
                    nombrePrivadoImagen: fotografia.nombrePrivadoImagen,
                },
            });

            if (yaRegistrado) {
                throw new HttpException(
                    `La fotografia para el usuario ${fotografia.codUsuario} ya está registrada`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Guardar la imagen usando AdministrarImagenes
            AdministrarImagenes.agregarImagen(
                fotografia.nombrePrivadoImagen,
                base64Imagen,
                rutasImagen.rutaFotosUsuario
            );

            const result = await this.imagenRepositorio.save(fotografia);
            return result;
        } catch (error) {
            throw new HttpException(`Fallo al registrar fotografia: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}