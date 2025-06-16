import { Module } from '@nestjs/common';
import { PythonService } from './python.service';
import { PythonController } from './python.controller';

@Module({
  providers: [PythonService],
  controllers: [PythonController]
})
export class PythonModule {}
