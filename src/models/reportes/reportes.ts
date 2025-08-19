import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuarios } from "../usuarios/usuarios";
import { Eventos } from "../eventos/eventos";
import { Registroasistencia } from "../registroasistencia/registroasistencia";

@Entity("reportes", {schema: "public"})
export class Reportes {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_reporte" })
    public idReporte: number;

    @Column({ type: "varchar", length: 250, name: "descripcion", nullable: false })
    public descripcion: string;

    @Column({ type: "date", name: "fecha_reporte", nullable: false })
    public fechaReporte: Date;

    @Column({ type: "varchar", length: 12, name: "cod_usuario", nullable: false })
    public codUsuario: string;

    @Column({ type: "integer", name: "cod_evento", nullable: false })
    public codEvento: number;

    @Column({ type: "integer", name: "cod_asistencia", nullable: false })
    public codAsistencia: number;

    //relacion con la tabla usuarios 1 a muchos
    @ManyToOne(() => Usuarios, (objUsuario: Usuarios) => objUsuario.codReporteU, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    
        })
    @JoinColumn([{ name: "cod_usuario", referencedColumnName: "codUsuario" }])
    public codUsuarioR?: Usuarios;//no es obligatorio

    //Relacion con la tabla eventos 1 a muchos
    @ManyToOne(() => Eventos, (objEvento: Eventos) => objEvento.codReporteE, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    
        })
    @JoinColumn([{ name: "cod_evento", referencedColumnName: "codEvento" }])
    public codEventoR?: Eventos;//no es obligatorio

    //Relacion con la tabla registroasistencia 1 a muchos
    @ManyToOne(() => Registroasistencia, (objRegistro: Registroasistencia) => objRegistro.codReporteRegis, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    
        })
    @JoinColumn([{ name: "cod_asistencia", referencedColumnName: "codAsistencia" }])
    public codRegistroRepo?: Registroasistencia;//no es obligatorio

    constructor(idReporte: number, descripcion: string, fechaReporte: Date, codUsuario: string, codEvento: number, codAsistencia: number) {
        this.idReporte = idReporte;
        this.descripcion = descripcion;
        this.fechaReporte = fechaReporte;
        this.codUsuario = codUsuario;
        this.codEvento = codEvento;
        this.codAsistencia = codAsistencia;
    }
}
