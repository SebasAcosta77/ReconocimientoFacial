import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Eventos } from '../models/eventos/eventos';
import { Registroasistencia } from '../models/registroasistencia/registroasistencia';
import { Usuarios } from '../models/usuarios/usuarios';

@Injectable()
export class MailService {
    private eventosRepository: Repository<Eventos>;
    private registroAsistenciaRepository: Repository<Registroasistencia>;
    private usuariosRepository: Repository<Usuarios>;

    constructor(
        private mailerService: NestMailerService,
        private dataSource: DataSource,
    ) {
        this.eventosRepository = dataSource.getRepository(Eventos);
        this.registroAsistenciaRepository = dataSource.getRepository(Registroasistencia);
        this.usuariosRepository = dataSource.getRepository(Usuarios);
    }

    async sendEventEndNotifications(): Promise<void> {
        try {
            const now = new Date();
            const events = await this.eventosRepository.find({
                where: {
                    horaFinEvento: LessThanOrEqual(now),
                    notificado: false,
                },
            });

            for (const event of events) {
                const asistencias = await this.registroAsistenciaRepository.find({
                    where: { codEvento: event.codEvento },
                    relations: ['codUsuarioRegis'],
                });

                for (const asistencia of asistencias) {
                    const user = asistencia.codUsuarioRegis;
                    if (user && user.correoUsuario) {
                        await this.mailerService.sendMail({
                            to: user.correoUsuario,
                            subject: `Finalización del evento: ${event.nombreEvento}`,
                            template: './event-end',
                            context: {
                                eventName: event.nombreEvento,
                                endTime: event.horaFinEvento.toLocaleString(),
                                description: event.descripcionEvento,
                                lugarEvento: event.lugarEvento,
                                tipoEvento: event.tipoEvento,
                            },
                        });
                        console.log(`Correo enviado a ${user.correoUsuario} para el evento ${event.nombreEvento}`);
                    }
                }

                event.notificado = true;
                await this.eventosRepository.save(event);
            }
        } catch (error) {
            throw new HttpException(`Fallo al enviar notificaciones: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}