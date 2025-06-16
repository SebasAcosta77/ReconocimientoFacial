import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'jsacosta@jdc.edu.co',
                    pass: 'qvyg yeoj zber esqa', // Reemplaza con tu contraseña de aplicación
                },
            },
            defaults: {
                from: '"Sistema de Eventos" <jsacosta@jdc.edu.co>',
            },
            template: {
                dir: join(process.cwd(), 'dist', 'mailer', 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },

        }),

    ],
    providers: [MailService],
    controllers: [MailerController]

})
export class MailModule {

}
