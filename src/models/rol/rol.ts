import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Acceso } from "../acceso/acceso";
import { Usuarios } from "../usuarios/usuarios";

@Entity("roles", { schema: "public" })

export class Rol {
    @PrimaryGeneratedColumn({ type: "integer", name: "cod_rol" })
    public codRol: number;
    @Column({ type: "varchar", length: 250, name: "nombre_rol", nullable: false })
    public nombreRol: string;
    @Column({ type: "integer", name: "estado_rol", default: 1, nullable: false })
    public estadoRol: number;

    @ManyToOne(() => Usuarios, (objUsuario) => objUsuario.rol)
    public usuarios?: Usuarios[];

    constructor(cod: number, nom: string, est: number) {

        this.codRol = cod;
        this.nombreRol = nom;
        this.estadoRol = est;
    }
}
