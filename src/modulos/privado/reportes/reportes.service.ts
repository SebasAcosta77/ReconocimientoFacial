import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  Scope,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Reportes } from 'src/models/reportes/reportes';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Eventos } from 'src/models/eventos/eventos';

@Injectable({ scope: Scope.REQUEST })
export class ReportesService {
  private reportesRepository: Repository<Reportes>;
  private eventosRepository: Repository<Eventos>;

  constructor(
    private poolConexion: DataSource,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    this.reportesRepository = poolConexion.getRepository(Reportes);
    this.eventosRepository = poolConexion.getRepository(Eventos);
  }

  // Consultar todos los reportes
  public async consultar(): Promise<any> {
    try {
      return this.reportesRepository.find();
    } catch (miError) {
      throw new HttpException(
        'Fallo al consultar el reporte',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Verificar si existe un reporte con esa descripción
  public async verificarReporte(descripcion: string): Promise<boolean> {
    try {
      const existe = await this.reportesRepository.findBy({
        descripcion: descripcion,
      });
      return existe.length > 0;
    } catch (miError) {
      throw new HttpException(
        'No hay envío de información',
        HttpStatus.CONFLICT,
      );
    }
  }

  // Registrar un reporte (sin pedir codAsistencia y tomando el usuario logueado)
  public async registrar(objReporte: Partial<Reportes>): Promise<any> {
    try {
      // ✅ Validar que el evento exista
      const evento = await this.eventosRepository.findOne({
        where: { codEvento: objReporte.codEvento },
      });

      if (!evento) {
        throw new HttpException('El evento no existe', HttpStatus.BAD_REQUEST);
      }

      // ✅ Verificar si ya existe un reporte con la misma descripción en ese evento
      const existe = await this.reportesRepository.findOne({
        where: {
          descripcion: objReporte.descripcion,
          codEvento: objReporte.codEvento,
        },
      });

      if (existe) {
        throw new HttpException(
          'El reporte ya existe para este evento',
          HttpStatus.BAD_REQUEST,
        );
      }

      // ✅ Crear el nuevo reporte
      const nuevoReporte = this.reportesRepository.create({
        descripcion: objReporte.descripcion,
        fechaReporte: objReporte.fechaReporte
          ? new Date(objReporte.fechaReporte)
          : new Date(),
        codEvento: objReporte.codEvento,
        codUsuario: objReporte.codUsuario, // ✅ ahora se asigna desde el body
      });

      await this.reportesRepository.save(nuevoReporte);

      return {
        mensaje: 'Reporte registrado correctamente',
        reporte: nuevoReporte,
      };
    } catch (error) {
      console.error('Error al registrar el reporte:', error);
      throw new HttpException(
        'Fallo al hacer el reporte',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Consultar un reporte por ID
  public async consultarUno(codigo: number): Promise<any> {
    try {
      return this.reportesRepository.findBy({ idReporte: codigo });
    } catch (miError) {
      throw new HttpException(
        'Fallo al consultar el reporte',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Actualizar un reporte
  public async actualizar(objReporte: Reportes, codigo: number): Promise<any> {
    try {
      if (await this.verificarReporte(objReporte.descripcion)) {
        return new HttpException(
          'El reporte ya existe',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const objActualizado = await this.reportesRepository.update(
          { idReporte: codigo },
          objReporte,
        );
        return new HttpException(
          { mensaje: 'Reporte actualizado', objeto: objActualizado },
          HttpStatus.OK,
        );
      }
    } catch (MiError) {
      throw new HttpException(
        'Fallo al actualizar el reporte',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Eliminar reporte
  public async eliminar(codigo: number): Promise<any> {
    try {
      return this.reportesRepository.delete({ idReporte: codigo });
    } catch (MiError) {
      throw new HttpException(
        'Fallo al eliminar el reporte',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Consultar reportes por usuario
  public async consultarPorUsuario(codUsuario: string): Promise<any> {
    try {
      return this.reportesRepository.find({
        where: { codUsuario },
        relations: ['codUsuarioR', 'codEventoR', 'codRegistroRepo'],
      });
    } catch (error) {
      throw new HttpException(
        'Error al consultar reportes por usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Consultar reportes por evento
  public async consultarPorEvento(codEvento: number): Promise<any> {
    try {
      return this.reportesRepository.find({
        where: { codEvento },
        relations: ['codUsuarioR', 'codEventoR', 'codRegistroRepo'],
      });
    } catch (error) {
      throw new HttpException(
        'Error al consultar reportes por evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Consultar reportes por fecha
  public async consultarPorFecha(fecha: Date): Promise<any> {
    try {
      return this.reportesRepository.find({ where: { fechaReporte: fecha } });
    } catch (error) {
      throw new HttpException(
        'Error al consultar reportes por fecha',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Consultar todos los reportes con relaciones
  public async consultarTodoConRelaciones(): Promise<any> {
    try {
      return this.reportesRepository.find({
        relations: ['codUsuarioR', 'codEventoR', 'codRegistroRepo'],
        order: { fechaReporte: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(
        'Fallo al consultar reportes con relaciones',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Generar informe PDF de un evento
  // === Nuevo método corregido ===
  public async generarInformeEvento(
    codEvento: number,
    res: Response,
  ): Promise<void> {
    try {
      // ✅ Aceptar token desde query string
      const token = this.request.query.token as string;

      if (!token) {
        throw new HttpException('Token requerido', HttpStatus.UNAUTHORIZED);
      }

      // ✅ Verificar el token
      const jwt = require('jsonwebtoken');
      let datosSesion;
      try {
        datosSesion = jwt.verify(
          token,
          process.env.JWT_SECRET || 'laClaveSuperSecreta',
        );
      } catch {
        throw new HttpException(
          'Token inválido o expirado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // ✅ Buscar el evento
      const eventoRepo = this.poolConexion.getRepository('Eventos');
      const evento = await eventoRepo.findOne({
        where: { codEvento },
        relations: ['codReporteE', 'codRegistroE'],
      });

      if (!evento) {
        throw new HttpException(
          `No se encontró el evento con código ${codEvento}`,
          HttpStatus.NOT_FOUND,
        );
      }

      const fechaInicio = evento.fechaInicioEvento
        ? new Date(evento.fechaInicioEvento)
        : null;
      const fechaFin = evento.fechaFinEvento
        ? new Date(evento.fechaFinEvento)
        : null;

      // ✅ Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="informe_evento_${evento.codEvento}.pdf"`,
      );

      doc.pipe(res);

      // === Encabezado ===
      doc
        .fontSize(20)
        .fillColor('#1a73e8')
        .text('INFORME DE EVENTO', { align: 'center' })
        .moveDown(1);

      // === Datos del evento ===
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(`Código: ${evento.codEvento}`)
        .text(`Nombre: ${evento.nombreEvento}`)
        .text(`Descripción: ${evento.descripcionEvento}`)
        .text(`Lugar: ${evento.lugarEvento}`)
        .text(
          `Fecha: ${
            fechaInicio ? fechaInicio.toLocaleDateString('es-CO') : 'N/A'
          } - ${fechaFin ? fechaFin.toLocaleDateString('es-CO') : 'N/A'}`,
        )
        .moveDown(1);

      // === Reportes asociados ===
      doc.fontSize(14).fillColor('#1a73e8').text('Reportes del Evento', {
        underline: true,
      });

      if (evento.codReporteE && evento.codReporteE.length > 0) {
        doc.moveDown(0.5);
        evento.codReporteE.forEach((rep, i) => {
          const fechaRep = rep.fechaReporte
            ? new Date(rep.fechaReporte).toLocaleDateString('es-CO')
            : 'N/A';

          doc
            .fontSize(12)
            .fillColor('#000')
            .text(
              `${i + 1}. ${rep.descripcion} (Usuario: ${
                rep.codUsuario ?? 'N/A'
              }, Fecha: ${fechaRep})`,
            )
            .moveDown(0.3);
        });
      } else {
        doc
          .moveDown(0.5)
          .fontSize(12)
          .fillColor('#777')
          .text('No hay reportes registrados para este evento.')
          .moveDown(1);
      }

      // === Lista de asistencia ===
      doc.moveDown(1);
      doc.fontSize(14).fillColor('#1a73e8').text('Lista de Asistencia', {
        underline: true,
      });

      if (evento.codRegistroE && evento.codRegistroE.length > 0) {
        const tableTop = doc.y + 15;
        const col = { n: 50, usuario: 90, estado: 200, observacion: 330 };
        const colWidths = { usuario: 100, estado: 120, observacion: 200 };

        // Encabezado tabla
        doc
          .fillColor('#fff')
          .rect(45, tableTop - 5, 500, 25)
          .fill('#1a73e8')
          .stroke();

        doc
          .fontSize(12)
          .fillColor('#fff')
          .text('N°', col.n, tableTop)
          .text('Usuario', col.usuario, tableTop)
          .text('Estado Validación', col.estado, tableTop)
          .text('Observación', col.observacion, tableTop);

        let y = tableTop + 25;

        evento.codRegistroE.forEach((reg, i) => {
          const estado = reg.estadoValidacion ? 'Validado' : 'No validado';
          const obs = reg.observacionesAsistencia ?? 'Sin observaciones';

          const obsHeight = doc.heightOfString(obs, {
            width: colWidths.observacion,
          });
          const rowHeight = Math.max(20, obsHeight + 5);

          if (i % 2 === 0) {
            doc
              .rect(45, y - 5, 500, rowHeight)
              .fill('#f8f9fa')
              .stroke();
            doc.fillColor('#000');
          }

          doc
            .fontSize(11)
            .fillColor('#000')
            .text(i + 1, col.n, y)
            .text(reg.codUsuario ?? 'N/A', col.usuario, y)
            .text(estado, col.estado, y)
            .text(obs, col.observacion, y, {
              width: colWidths.observacion,
              height: rowHeight,
            });

          y += rowHeight;
        });
      } else {
        doc
          .moveDown(0.5)
          .fontSize(12)
          .fillColor('#777')
          .text('No hay registros de asistencia para este evento.')
          .moveDown(1);
      }

      // === Pie de página ===
      doc
        .moveDown(2)
        .fontSize(10)
        .fillColor('#999')
        .text(
          `Generado automáticamente el ${new Date().toLocaleString('es-CO')}`,
          { align: 'center' },
        );

      doc.end();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new HttpException(
        'Error al generar el informe PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📌 Actualizar reporte por código de evento
  public async actualizarPorEvento(
    codEvento: number,
    objReporte: Partial<Reportes>,
  ): Promise<any> {
    try {
      // Verificar si existe el evento
      const evento = await this.eventosRepository.findOne({
        where: { codEvento },
      });

      if (!evento) {
        throw new HttpException('El evento no existe', HttpStatus.NOT_FOUND);
      }

      // Buscar reportes asociados a ese evento
      const reporteExistente = await this.reportesRepository.findOne({
        where: { codEvento },
      });

      if (!reporteExistente) {
        throw new HttpException(
          'No hay reportes asociados a este evento',
          HttpStatus.NOT_FOUND,
        );
      }

      // Actualizar los campos del reporte
      await this.reportesRepository.update(
        { codEvento },
        {
          descripcion: objReporte.descripcion ?? reporteExistente.descripcion,
          fechaReporte: objReporte.fechaReporte
            ? new Date(objReporte.fechaReporte)
            : reporteExistente.fechaReporte,
          codUsuario: objReporte.codUsuario ?? reporteExistente.codUsuario,
        },
      );

      const actualizado = await this.reportesRepository.find({
        where: { codEvento },
      });

      return {
        mensaje: `Reporte(s) del evento ${codEvento} actualizado(s) correctamente`,
        reporteActualizado: actualizado,
      };
    } catch (error) {
      console.error('Error al actualizar reporte por evento:', error);
      throw new HttpException(
        'Fallo al actualizar el reporte por evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 📌 Eliminar todos los reportes asociados a un evento
  public async eliminarPorEvento(codEvento: number): Promise<any> {
    try {
      // Verificar si el evento existe
      const evento = await this.eventosRepository.findOne({
        where: { codEvento },
      });

      if (!evento) {
        throw new HttpException('El evento no existe', HttpStatus.NOT_FOUND);
      }

      // Verificar si hay reportes asociados al evento
      const reportesAsociados = await this.reportesRepository.find({
        where: { codEvento },
      });

      if (reportesAsociados.length === 0) {
        throw new HttpException(
          'No hay reportes asociados a este evento',
          HttpStatus.NOT_FOUND,
        );
      }

      // Eliminar todos los reportes del evento
      await this.reportesRepository.delete({ codEvento });

      return {
        mensaje: `Se eliminaron correctamente ${reportesAsociados.length} reporte(s) del evento ${codEvento}`,
      };
    } catch (error) {
      console.error('Error al eliminar reportes por evento:', error);
      throw new HttpException(
        'Fallo al eliminar los reportes por evento',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
