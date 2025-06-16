export const ACCESO_SQL = {
    DATOS_SESION: "SELECT u.documento, u.nombres, u.apellidos, u.telefono, \
    (SELECT nombre_rol FROM roles WHERE cod_rol= u.cod_rol) as nombre_rol, a.nombre_acceso \
    FROM accesos a INNER JOIN usuarios u ON u.documento=a.cod_usuario WHERE a.cod_usuario=$1",
}