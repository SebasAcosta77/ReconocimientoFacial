
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Seguridad } from '../../../middlewar/seguridad/seguridad'; // ✅ Importación correcta

@Module({
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Seguridad)
      .forRoutes(ReportesController); // 🔒 Protege todas las rutas del controlador
  }
}
