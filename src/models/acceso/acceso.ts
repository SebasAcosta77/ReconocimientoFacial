import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Usuarios } from "../usuarios/usuarios";

@Entity("accesos", {schema: "public"})
export class Acceso {

    @PrimaryColumn({type: "varchar", name: "cod_usuario", nullable: false})
    public codUsuario: string;

    @Column({type:"varchar", length:500, name: "nombre_acceso", nullable: false})
    public nombreAcceso: string;

    @Column({type: "varchar", length: 500, name: "clave_acceso", nullable: false})
    public claveAcceso: string;

    @OneToOne(()=> Usuarios, (objUsuario)=>objUsuario.acceso,{
        onDelete:"RESTRICT",
        onUpdate:"CASCADE"
    })

    @JoinColumn({name:"cod_usuario", referencedColumnName: "codUsuario"})
    public codUsuarioA ?: Usuarios;    



    constructor(cod: string, nom: string, cla: string){
        this.codUsuario = cod,
        this.nombreAcceso = nom,
        this.claveAcceso = cla
    }
}
