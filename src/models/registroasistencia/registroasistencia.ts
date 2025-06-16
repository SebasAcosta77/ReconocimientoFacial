import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Usuarios } from "../usuarios/usuarios";
import { Eventos } from "../eventos/eventos";
import { Reportes } from "../reportes/reportes";

@Entity("registroasistencia", { schema: "public" })
export class Registroasistencia {
    @PrimaryGeneratedColumn({ type: "integer", name: "cod_asistencia" })
    public codAsistencia: number;

    @Column({ type: 'timestamp', name: 'hora_entrada', nullable: false })
    horaEntrada: Date;

    @Column({ type: "boolean", name: "estado_validacion", nullable: false })
    public estadoValidacion: Boolean;

    @Column({ type: "varchar", length: 150, name: "observaciones", nullable: false })
    public observacionesAsistencia: string;

    @Column({ type: "varchar", length: 12, name: "cod_usuario", nullable: false })
    public codUsuario: string;

    @Column({ type: "integer", name: "cod_evento", nullable: false })
    public codEvento: number

    //relacion con la tabla usuarios 1 a muchos
    @ManyToOne(() => Usuarios, (objUsuario: Usuarios) => objUsuario.codRegisA, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"

    })
    @JoinColumn([{ name: "cod_usuario", referencedColumnName: "codUsuario" }])
    public codUsuarioRegis?: Usuarios;//no es obligatorio

    //Relacion con la tabla eventos 1 a muchos
    @ManyToOne(() => Eventos, (objEvento: Eventos) => objEvento.codRegistroE, {// muchos a uno imagen - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"

    })
    @JoinColumn([{ name: "cod_evento", referencedColumnName: "codEvento" }])
    public codEventoR?: Eventos;//no es obligatorio

    //relacion con la tabla reportes 1 a muchos
    @OneToMany(() => Reportes, (objReporte: Reportes) => objReporte.codRegistroRepo, { //muchos a uno municipio - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    public codReporteRegis?: Reportes[];



    constructor(codasistencia: number, horaEntrada: Date, estadoValidacion: Boolean, observacionesAsistencia: string, codUsuario: string, codEvento: number) {
        this.codEvento = codEvento;
        this.codUsuario = codUsuario;
        this.codAsistencia = codasistencia;
        this.horaEntrada = horaEntrada;
        this.estadoValidacion = estadoValidacion;
        this.observacionesAsistencia = observacionesAsistencia;
    }
}
