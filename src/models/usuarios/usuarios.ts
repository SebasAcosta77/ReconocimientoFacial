import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Fotografias } from '../fotografias/fotografias';
import { Registroasistencia } from '../registroasistencia/registroasistencia';
import { Reportes } from '../reportes/reportes';
import { Acceso } from '../acceso/acceso';
import { Rol } from '../rol/rol';
import { Eventos } from '../eventos/eventos';

@Entity('usuarios', { schema: 'public' })
export class Usuarios {
  @PrimaryColumn({
    type: 'varchar',
    length: 12,
    name: 'documento',
    nullable: false,
  })
  public codUsuario: string;

  @Column({ type: 'varchar', length: 100, name: 'nombres', nullable: false })
  public nombrsUsuario: string;

  @Column({ type: 'varchar', length: 100, name: 'apellidos', nullable: false })
  public apellidosUsuario: string;

  @Column({
    type: 'date',
    name: 'fecha_nacimiento',
    default: new Date(Date.now()),
  })
  public fechaNacimientoUsuario: Date;

  @Column({
    type: 'varchar',
    length: 150,
    name: 'correo_electronico',
    nullable: false,
  })
  public correoUsuario: string;

  @Column({ type: 'varchar', length: 20, name: 'telefono', nullable: false })
  public telefonoUsuario: string;

  @Column({ type: 'integer', name: 'cod_rol', nullable: true, default: 1 })
  public codRol: number;

  //relacion con la tabla fotografias 1 a muchos
  @OneToMany(
    () => Fotografias,
    (objImagen: Fotografias) => objImagen.codUsuarioI,
    {
      //muchos a uno municipio - sitio
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  public codImagenU?: Fotografias[];

  //relacion con la tabla registro 1 a muchos
  @OneToMany(
    () => Registroasistencia,
    (objRegistro: Registroasistencia) => objRegistro.codReporteRegis,
    {
      //muchos a uno municipio - sitio
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  public codRegisA?: Registroasistencia[];

  //relacion con la tabla reportes 1 a muchos
  @OneToMany(() => Reportes, (objReporte: Reportes) => objReporte.codUsuarioR, {
    //muchos a uno municipio - sitio
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  public codReporteU?: Reportes[];

  @OneToOne(() => Acceso, (objAcceso: Acceso) => objAcceso.codUsuarioA)
  public acceso?: Acceso;

  //foranea
  @ManyToOne(() => Rol, (rol: Rol) => rol.usuarios, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    eager: false, // opcional
  })
  @JoinColumn({ name: 'cod_rol', referencedColumnName: 'codRol' })
  public rol?: Rol;

  constructor(
    codUsuario: string,
    nombrsUsuario: string,
    apellidosUsuario: string,
    fechaNacimientoUsuario: Date,
    correoUsuario: string,
    telefonoUsuario: string,
  ) {
    this.codUsuario = codUsuario;
    this.nombrsUsuario = nombrsUsuario;
    this.apellidosUsuario = apellidosUsuario;
    this.fechaNacimientoUsuario = fechaNacimientoUsuario;
    this.correoUsuario = correoUsuario;
    this.telefonoUsuario = telefonoUsuario;
  }
}
