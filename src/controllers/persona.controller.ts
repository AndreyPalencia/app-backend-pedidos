import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import fetch from 'node-fetch';
import { Llaves } from '../config/llaves';
import {Persona} from '../models/persona.model';
import {PersonaRepository} from '../repositories';
import { AutentificacionService } from '../services';

export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,
    @service(AutentificacionService)
    public autentificacionService : AutentificacionService
  ) {}

  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {
    //Genar Clave 
    let clave = this.autentificacionService.GeneradorClave();
    let claveCifrada = this.autentificacionService.CifraClave(clave);
    persona.clave = claveCifrada;
    let p = await this.personaRepository.create(persona);
    //Notificar por correo al usuario la clave generada
    let destino = persona.correo;
    let asunto = 'Registro En la Plataforma Pedidos LoopBack';
    let contenido = `Pedidos LoopBack: Le da la "Bienvenidad" se a creado su cuenta con en Sistema
     ${persona.nombre}, ${persona.apellido} Tu Nombre de Usuario es : ${persona.correo}, 
     Tu clave es: ${persona.clave} `;
    fetch(`${Llaves.urlServicioNotificaciones}+'/correo-electronico?destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then((data: any ) => {
      console.log(data);
    });
    //Notificar por sms al usuario la clave generada
    let mensaje = 'Pedidos LoopBack: Le da la "Bienvenidad" se a creado su cuenta con en Sistema '
    + persona.nombre + "Tu Nombre de Usuario es : " + persona.correo + "Tu clave es: " + persona.clave;
    let telefono = '3015652567';
    fetch(Llaves.urlServicioNotificaciones+'/sms?mensaje=' + mensaje + '&telefono=' + telefono)
    .then((data: any ) => {
      console.log(data);
    });
    return p;

  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
