import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PythonService {
  private pythonApiUrl = 'http://localhost:5000'; // URL correcta del servidor Python

  // Iniciar el reconocimiento facial
  public async iniciarReconocimiento(codEvento: number, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.pythonApiUrl}/api/start`,
        { cod_evento: codEvento },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return {
        mensaje: 'Reconocimiento iniciado correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error('Error al iniciar el reconocimiento facial:', error.response?.data || error.message);
      throw new HttpException(
        `Error al conectar con el servicio de Python: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Detener el reconocimiento facial
  public async detenerReconocimiento(): Promise<any> {
    try {
      const response = await axios.post(`${this.pythonApiUrl}/api/stop`);
      return {
        mensaje: 'Reconocimiento detenido correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error('Error al detener el reconocimiento facial:', error.response?.data || error.message);
      throw new HttpException(
        `Error al conectar con el servicio de Python: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
