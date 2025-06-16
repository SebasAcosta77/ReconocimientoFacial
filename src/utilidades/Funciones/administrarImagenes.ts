
import { mkdirSync, readdir, unlink, writeFile } from "fs";
import * as sharp from "sharp";
class AdministrarImagenes {
    public static agregarImagen(nombrePrivadoImagen: string, base64: string, rutaAlmacenamientoImagen: string): void {
        let decodificacion = base64.replace(/^data:image\/\w+;base64,/, "");
        readdir(rutaAlmacenamientoImagen, (miError) => {
            if (miError) {
                mkdirSync(rutaAlmacenamientoImagen, { recursive: true });
            }

        });
        console.log(decodificacion);

        writeFile(rutaAlmacenamientoImagen + nombrePrivadoImagen, decodificacion, { encoding: "base64" }, () => { });
    }
    public static removerImagen(nombrePrivadoImagen: string, rutaAlmacenamientoImagen: string): void {
        unlink(rutaAlmacenamientoImagen + nombrePrivadoImagen, (noEncontrada) => {
            if (noEncontrada) {
                console.log("fallo al eliminar la imagen");
            }
        });
    }
    public static gestionarTamanoImagen(nombrePrivadoImagen: string, tamanoImagen: number, imagenModificada: string): any {
        let esperarTmp = true;

        const dataSharp = sharp(nombrePrivadoImagen).resize({ width: tamanoImagen }).toFile(imagenModificada, (miError) => {
            if (miError) {
                console.log(miError);

            } else {
                esperarTmp = false;

            }
        });
        while (esperarTmp) {
            require("deasync").sleep(250);

        }
        return dataSharp;

    }
}

export default AdministrarImagenes;