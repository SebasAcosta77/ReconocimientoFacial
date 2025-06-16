import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Usuarios } from "../usuarios/usuarios";

@Entity("fotografias", {schema: "public"})
export class Fotografias {
    @PrimaryGeneratedColumn({ type: "integer", name: "cod_imagen" })
    public codImagen: number;
    @Column({ type: "integer", name: "tamano_imagen", nullable: false })
    public tamanoImagen: number;
    @Column({ type: "varchar", length: 250, name: "formato_imagen", nullable: false })
    public formatoImagen: string;
    @Column({ type: "date", name: "fecha_registro", nullable: false })
    public fechaRegistro: Date;
    @Column({ type: "varchar", length:12, name: "cod_usuario", nullable: false })
    public codUsuario: string;
    @Column({type: "varchar", length:250, name: "nombre_publico_imagen", nullable:false})
    public nombrePublicoImagen: string;
    @Column({type: "varchar", length:250, name: "nombre_privado_imagen", nullable:false})
    public nombrePrivadoImagen: string;

    //relacion con la tabla usuarios 1 a muchos
    @ManyToOne(() => Usuarios, (objUsuario: Usuarios) => objUsuario.codImagenU, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    @JoinColumn([{ name: "cod_usuario", referencedColumnName: "codUsuario" }])
    public codUsuarioI?: Usuarios;//no es obligatorio

    public base64Imagen?: string;//campo opcional */

    constructor(codImagen: number,  fechaRegistro: Date, codusario: string, nombrePublicoImagen: string,  nombrePrivadoImagen: string, tamanoImagen: number, formatoImagen: string) {
        this.tamanoImagen = tamanoImagen;
        this.formatoImagen = formatoImagen;
        this.nombrePublicoImagen = nombrePublicoImagen;  
        this.nombrePrivadoImagen = nombrePrivadoImagen;     
        this.codImagen = codImagen;
        this.fechaRegistro = fechaRegistro;
        this.codUsuario = codusario;
    }

    
}
