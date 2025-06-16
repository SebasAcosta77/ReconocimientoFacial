import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const port = Number(process.env.PORT_SERVER)
  const app = await NestFactory.create(AppModule);

  // Aumenta el límite del tamaño del body
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.enableCors({
    origin: 'http://localhost:5000', // Permite el servicio en Python
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
  });

  


  await app.listen(port, ()=>{
    console.log('Servidor funcionando en puerto' + port)

  });
}
bootstrap();
