import { existsSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import rutasImagenes from '../../../utilidades/Dominios/var_imagenes';
import AdministrarImagenes from "src/utilidades/Funciones/administrarImagenes";
import { Fotografias } from "src/models/fotografias/fotografias";

class ImagenVerificar {
    public static consultarBase64(registros: Fotografias[]): Fotografias[] {
        registros.forEach((objImagen) => {
            const rutaUbicacionImagen = join(rutasImagenes.rutaFotoSistema, objImagen.nombrePrivadoImagen);
            let base64 = "";

            if (existsSync(rutaUbicacionImagen)) {
                // Crear versión redimensionada temporal
                const imagenDimensionada = join(rutasImagenes.rutaFotostemporal, objImagen.nombrePrivadoImagen);
                
                // Redimensionar y leer la imagen temporal
                AdministrarImagenes.gestionarTamanoImagen(rutaUbicacionImagen, 500, imagenDimensionada);
                base64 = readFileSync(imagenDimensionada, "base64");

                // Eliminar imagen temporal
                unlinkSync(imagenDimensionada);
            } else {
                // Imagen no encontrada, usar imagen por defecto
                base64 = readFileSync(rutasImagenes.fotoDefecto, "base64");
            }

            // Asignar imagen en base64 al objeto
            objImagen.base64Imagen = base64;
        });

        return registros;
    }
}

export default ImagenVerificar;
