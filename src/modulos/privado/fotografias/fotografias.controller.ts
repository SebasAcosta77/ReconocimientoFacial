import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { FotografiasService } from './fotografias.service';
import { Fotografias } from 'src/models/fotografias/fotografias';
import { v4 as uuidv4 } from "uuid";

@Controller('fotografias')
export class FotografiasController {
    constructor(private readonly imagenService: FotografiasService) { }

    // Obtener imágenes por usuario (unificado: elimina redundancia entre obtenerImage y obtenerImagenes)
    @Get(":codUsuario")
    public async obtenerImagenes(@Param("codUsuario") codUsuario: string) {
        if (!codUsuario || codUsuario.trim() === "") {
            throw new HttpException("El código de usuario no es válido", HttpStatus.BAD_REQUEST);
        }

        try {
            const imagenes = await this.imagenService.consultar(codUsuario);
            if (!imagenes || imagenes.length === 0) {
                throw new HttpException(`No se encontraron imágenes para el usuario ${codUsuario}`, HttpStatus.NOT_FOUND);
            }
            return { mensaje: "Imágenes obtenidas correctamente", data: imagenes };
        } catch (error) {
            throw new HttpException(`Error al consultar imágenes para el usuario ${codUsuario}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Registrar una imagen
    @Post("/add")
    public async registrarImagen(@Body() objImagen: Fotografias) {
        try {
            if (!objImagen.formatoImagen) {
                throw new HttpException("El formato de la imagen es requerido", HttpStatus.BAD_REQUEST);
            }
            const tipoImagen = objImagen.formatoImagen.split("/")[1];
            const nombrePrivado = `${objImagen.codUsuario}_IMG${uuidv4()}.${tipoImagen}`;
            objImagen.nombrePrivadoImagen = nombrePrivado;
            const resultado = await this.imagenService.registrar(objImagen);
            return { mensaje: "Imagen registrada correctamente", data: resultado };
        } catch (error) {
            throw new HttpException(`Error al registrar la imagen: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar imagen (unificado: elimina redundancia entre actualizarImagen y actializarImagenParametro)
    @Put(":codImagen")
    public async actualizarImagen(@Body() objActualizar: Fotografias, @Param("codImagen") codImagen: string) {
        const codigo = Number(codImagen);
        if (isNaN(codigo)) {
            throw new HttpException("Código de imagen no válido", HttpStatus.BAD_REQUEST);
        }

        try {
            const resultado = await this.imagenService.actualizar(objActualizar, codigo);
            return { mensaje: "Imagen actualizada correctamente", data: resultado };
        } catch (error) {
            throw new HttpException(`Error al actualizar la imagen con codImagen ${codigo}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar imagen
    @Delete("/delete/:codImagen")
    public async eliminarImagen(@Param("codImagen") codImagen: string) {
        const codigo = Number(codImagen);
        if (isNaN(codigo)) {
            throw new HttpException("Código de imagen no válido", HttpStatus.BAD_REQUEST);
        }

        try {
            const resultado = await this.imagenService.eliminar(codigo);
            return { mensaje: "Imagen eliminada correctamente", data: resultado };
        } catch (error) {
            throw new HttpException(`Error al eliminar la imagen con codImagen ${codigo}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Listar todas las imágenes (para el servicio en Python)
    @Get("/listar/todass")
    public async listarTodasImagenes() {
        try {
            
            const imagenes = await this.imagenService.listarTodas();
            if (!imagenes.length) {
                return { mensaje: "No se encontraron imágenes", data: [] };
            }
            return { mensaje: "Imágenes listadas correctamente", data: imagenes };
        } catch (error) {
            throw new HttpException(`Error al listar todas las imágenes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('listar/todas')
    async listarTodas(): Promise<any> {
        const basePath = 'C:\\desarrollo\\back_comptervision\\src\\doc\\img\\usuario\\';
        const fotos = await this.imagenService.listarTodas(); // Este método ya debe existir

        const resultado = fotos.map((foto) => {
            return {
                codUsuario: foto.codUsuario,
                rutaImagen: basePath + foto.nombrePrivadoImagen // O `foto.archivoImagen` según el nombre de tu campo
            };
        });

        return {
            data: resultado
        };
    }
    @Post('/registrar')
    async registrar(@Body() body: { codUsuario: string; nombrePrivadoImagen: string; base64Imagen: string }): Promise<Fotografias> {
        try {
            const fotografia = new Fotografias(
                0, // codImagen (se generará automáticamente en la DB)
                new Date(), // fechaRegistro
                body.codUsuario, // codUsuario
                body.nombrePrivadoImagen, // nombrePublicoImagen (mismo valor que nombrePrivadoImagen para este caso)
                body.nombrePrivadoImagen, // nombrePrivadoImagen
                0, // tamanoImagen (se puede calcular después si es necesario)
                "image/jpeg" // formatoImagen (asumimos JPEG por defecto)
            );
            fotografia.codUsuario = body.codUsuario;
            fotografia.nombrePrivadoImagen = body.nombrePrivadoImagen;

            return await this.imagenService.registrarr(fotografia, body.base64Imagen);
        } catch (error) {
            throw new HttpException(`Fallo al registrar fotografia: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}