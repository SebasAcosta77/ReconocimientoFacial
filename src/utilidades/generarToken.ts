import { sign } from "jsonwebtoken";

class GenerarToken{

    public static procesarRespuesta(datosSesion: any): string{
        let token: string = "";
        token =  sign({
            id: datosSesion.documento,
            nombre: `${datosSesion.nombres} ${datosSesion.apellidos}`,
            rol: datosSesion.nombre_rol,
            telefono: datosSesion.telefono,
            acceso: datosSesion.nombre_acceso
        }, "laClaveSuperSecreta", { expiresIn: "8h"});
        return token;
    }

}
export default GenerarToken;