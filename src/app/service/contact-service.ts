
import { Injectable } from '@angular/core';

import emailjs from 'emailjs-com';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private SERVICE_ID = environment.emailjs.serviceId;
  private TEMPLATE_ID = environment.emailjs.templateId;

  constructor() {
    emailjs.init(environment.emailjs.publicKey);
  }
  sendContactEmail(data: any) {
    const templateParams = {
      nombre: data.nombre,
      email: data.email,
      mensaje: data.mensaje,
      acepto: data.acepto ? 'Sí' : 'No'
    };
    console.log('Enviando correo con params:', templateParams);

    return emailjs.send(
      this.SERVICE_ID,
      this.TEMPLATE_ID,
      templateParams
    );
  }
}
