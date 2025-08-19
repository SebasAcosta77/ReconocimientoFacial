import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnexionModule } from './config/connexion/connexion/connexion.module';
import { ConfigModule } from '@nestjs/config';
import { PrivadoModule } from './modulos/privado/privado.module';
import { PythonModule } from './modulos/python-service/python/python.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Seguridad } from './middlewar/seguridad/seguridad';
import { PublicModule } from './modules/public/public.module';
import { MailModule } from './mailer/mail.module';
import { TokenModule } from './utilidades/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ConnexionModule,
    PrivadoModule,
    PublicModule,
    PythonModule,
    TokenModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'doc', 'img', 'usuario'),
      serveRoot: '/uploads/imagenes', // Ruta pública
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, Seguridad],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Seguridad)
      .forRoutes({ path: '/privado/*', method: RequestMethod.ALL });
  }
}
