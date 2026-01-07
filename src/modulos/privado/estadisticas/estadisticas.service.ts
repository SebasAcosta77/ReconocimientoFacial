import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Usuarios } from 'src/models/usuarios/usuarios';
import { Eventos } from 'src/models/eventos/eventos';
import { Registroasistencia } from 'src/models/registroasistencia/registroasistencia';

@Injectable()
export class EstadisticasService {
  constructor(private dataSource: DataSource) {}

  async obtenerEstadisticasGenerales() {
    try {
      const usuarioRepo = this.dataSource.getRepository(Usuarios);
      const eventoRepo = this.dataSource.getRepository(Eventos);
      const registroRepo = this.dataSource.getRepository(Registroasistencia);

      // Totales globales
      const totalUsuarios = await usuarioRepo.count();
      const totalEventos = await eventoRepo.count();

      // Cargar eventos y registros con relaciones
      const eventos = await eventoRepo.find();
      const registros = await registroRepo.find({
        relations: ['codEventoR', 'codUsuarioRegis'],
      });

      // 🔹 Mapas acumuladores
      const eventoMap: Record<string, number> = {};
      const usuarioMap: Record<string, number> = {};
      const mesMap: Record<string, number> = {};

      // 1️⃣ Contar eventos por mes (aunque no haya asistencias)
      eventos.forEach((e) => {
        if (e.fechaInicioEvento) {
          const fechaObj = new Date(e.fechaInicioEvento);
          const mes = fechaObj.toLocaleString('es-ES', {
            month: 'short',
            year: 'numeric',
          });
          mesMap[mes] = (mesMap[mes] || 0) + 1;
        }
      });

      // 2️⃣ Contar asistencias por evento, usuario y mes
      registros.forEach((r) => {
        const evento = r.codEventoR?.nombreEvento ?? 'Sin evento';
        const usuario = r.codUsuarioRegis?.nombrsUsuario ?? 'Sin usuario';
        eventoMap[evento] = (eventoMap[evento] || 0) + 1;
        usuarioMap[usuario] = (usuarioMap[usuario] || 0) + 1;

        if (r.horaEntrada) {
          const fechaObj = new Date(r.horaEntrada);
          const mes = fechaObj.toLocaleString('es-ES', {
            month: 'short',
            year: 'numeric',
          });
          mesMap[mes] = (mesMap[mes] || 0) + 1;
        }
      });

      // 🔹 Convertir mapas a arreglos
      const reportesPorEvento = Object.entries(eventoMap).map(
        ([evento, total]) => ({
          evento,
          total,
        }),
      );

      const reportesPorUsuario = Object.entries(usuarioMap).map(
        ([usuario, total]) => ({
          usuario,
          total,
        }),
      );

      const reportesPorMes = Object.entries(mesMap)
        .map(([mes, total]) => ({ mes, total }))
        .sort((a, b) => {
          // Ordenar cronológicamente por año y mes
          const [m1, y1] = a.mes.split(' ');
          const [m2, y2] = b.mes.split(' ');
          const meses = [
            'ene',
            'feb',
            'mar',
            'abr',
            'may',
            'jun',
            'jul',
            'ago',
            'sep',
            'oct',
            'nov',
            'dic',
          ];
          return (
            parseInt(y1) - parseInt(y2) ||
            meses.indexOf(m1.toLowerCase()) - meses.indexOf(m2.toLowerCase())
          );
        });

      return {
        totalUsuarios,
        totalEventos,
        totalReportes: registros.length,
        reportesPorMes,
        reportesPorEvento,
        reportesPorUsuario,
      };
    } catch (error) {
      console.error('❌ Error al generar estadísticas:', error);
      throw new HttpException(
        'Error al generar estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async obtenerEventosPorTipo() {
    try {
      const eventoRepo = this.dataSource.getRepository(Eventos);

      // Agrupamos por tipo de evento
      const eventos = await eventoRepo
        .createQueryBuilder('evento')
        .select('evento.tipoEvento', 'tipo')
        .addSelect('COUNT(evento.codEvento)', 'cantidad')
        .groupBy('evento.tipoEvento')
        .getRawMany();

      // 🔸 Formato compatible con Nivo ResponsivePie
      const datosNivo = eventos.map((e) => ({
        id: e.tipo,
        label: e.tipo,
        value: Number(e.cantidad),
      }));

      return datosNivo;
    } catch (error) {
      console.error(
        '❌ Error al obtener estadísticas por tipo de evento:',
        error,
      );
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
