import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Registroasistencia } from "../registroasistencia/registroasistencia";
import { Reportes } from "../reportes/reportes";
import { Usuarios } from "../usuarios/usuarios";

@Entity("eventos", {schema: "public"})
export class Eventos {
    @PrimaryGeneratedColumn({type: "integer", name: "cod_evento"})
    public codEvento: number;

    @Column({type:"varchar", length:150, name: "nombre_evento", nullable: false})
    public nombreEvento: string;

    @Column({type:"varchar", length:250, name: "descripcion", nullable: false})
    public descripcionEvento: string;

    @Column({type:"varchar", length:150, name: "lugar", nullable: false})
    public lugarEvento: string;

    @Column({type: "date",  name: " fecha_inicio", default: new Date(Date.now())})
    public fechaInicioEvento: Date;

    @Column({type: "date",  name: " fecha_fin", default: new Date(Date.now())})
    public fechaFinEvento: Date;

    @Column({ type: 'timestamp', name: 'hora_inicio_evento', nullable: false })
    public horaInicioEvento: Date;

    @Column({ type: 'timestamp', name: 'hora_fin_evento', nullable: false })
    public horaFinEvento: Date;


    @Column({type:"varchar", length:50, name: "tipo_evento", nullable: false})
    public tipoEvento: string;

    @Column({ type: 'boolean', name: 'notificado', nullable: false, default: false })
    public notificado: boolean;

    //relacion con la tabla registroasistencia 1 a muchos
    @OneToMany(() => Registroasistencia, (objRegistro: Registroasistencia) => objRegistro.codEventoR, { //muchos a uno municipio - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"

        })
    public codRegistroE?: Registroasistencia[];

    //relacion con la tabla reportes 1 a muchos
    @OneToMany(() => Reportes, (objReporte: Reportes) => objReporte.codEventoR, { //muchos a uno municipio - sitio
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    })
    public codReporteE?: Reportes[];
    

    constructor(codevento: number, nombreEvento: string, descripcionEvento: string, lugarEvento: string, fechaInicioEvento: Date, fechaFinEvento: Date, tipoEvento: string, horaInicioEvento: Date, horaFinEvento: Date,  notificado: boolean) {
       
        this.codEvento = codevento;
        this.nombreEvento = nombreEvento;
        this.descripcionEvento = descripcionEvento;
        this.lugarEvento = lugarEvento;
        this.fechaInicioEvento = fechaInicioEvento;
        this.fechaFinEvento = fechaFinEvento;
        this.tipoEvento = tipoEvento;
        this.horaInicioEvento = horaInicioEvento;
        this.horaFinEvento = horaFinEvento;
        this.notificado = notificado;
    }

    


}
