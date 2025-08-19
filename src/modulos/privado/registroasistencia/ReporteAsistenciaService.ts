import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import * as stream from 'stream';

const PDFDocument = require('pdfkit');

@Injectable()
export class ReporteAsistenciaService {
  constructor(private readonly dataSource: DataSource) {}

  public async generarReportePDF(codEvento: number, res: Response): Promise<void> {
    // Obtener nombre del evento
    const evento = await this.dataSource.query(
      `SELECT nombre_evento FROM eventos WHERE cod_evento = $1`,
      [codEvento]
    );
    const nombreEvento = evento?.[0]?.nombre_evento || `#${codEvento}`;

    // Obtener registros de asistencia
    const registros = await this.dataSource.query(
      `
      SELECT 
        u.documento AS id,
        u.nombres,
        u.apellidos,
        r.estado_validacion AS asistio
      FROM registroasistencia r
      JOIN usuarios u ON r.cod_usuario = u.documento
      WHERE r.cod_evento = $1
      ORDER BY asistio DESC, u.nombres
      `,
      [codEvento]
    );

    const doc = new PDFDocument({ margin: 40 });
    const passthrough = new stream.PassThrough();

    res.setHeader('Content-Disposition', `attachment; filename=reporte_evento_${codEvento}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(passthrough);

    // Título
    doc.fontSize(16).text(`Reporte de Asistencia`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Evento: ${nombreEvento}`, { align: 'center' });
    doc.moveDown(1);

    // Coordenadas de la tabla
    const tableTop = doc.y + 20;
    const rowHeight = 20;

    // Definición de columnas
    const colWidths = {
      id: 120,
      nombres: 150,
      apellidos: 150,
      asistio: 80,
    };
    const startX = 50;

    const col2X = startX + colWidths.id;
    const col3X = col2X + colWidths.nombres;
    const col4X = col3X + colWidths.apellidos;
    const endX = col4X + colWidths.asistio;

    // Encabezados
    doc.fontSize(12).text('ID', startX + 5, tableTop + 5);
    doc.text('Nombres', col2X + 5, tableTop + 5);
    doc.text('Apellidos', col3X + 5, tableTop + 5);
    doc.text('Asistió', col4X + 5, tableTop + 5);

    // Líneas horizontales del encabezado
    doc.moveTo(startX, tableTop).lineTo(endX, tableTop).stroke();
    doc.moveTo(startX, tableTop + rowHeight).lineTo(endX, tableTop + rowHeight).stroke();

    // Filas
    let y = tableTop + rowHeight;

    registros.forEach((r: any) => {
      doc.moveTo(startX, y).lineTo(endX, y).stroke(); // línea superior

      doc.text(r.id.toString(), startX + 5, y + 5);
      doc.text(r.nombres, col2X + 5, y + 5);
      doc.text(r.apellidos, col3X + 5, y + 5);
      doc.text(r.asistio ? 'Sí' : 'No', col4X + 5, y + 5);

      y += rowHeight;
      doc.moveTo(startX, y).lineTo(endX, y).stroke(); // línea inferior
    });

    // Líneas verticales
    [startX, col2X, col3X, col4X, endX].forEach((x) => {
      doc.moveTo(x, tableTop).lineTo(x, y).stroke();
    });

    doc.end();
    passthrough.pipe(res);
  }
}
