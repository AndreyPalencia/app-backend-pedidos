import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Llaves } from '../config/llaves';
import { Persona } from '../models';
import { PedidoRepository, PersonaRepository } from '../repositories';

const generador = require('password-generator');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutentificacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepositorio: PersonaRepository
  ) {}

  /*
   * Add service methods here
   */
  GeneradorClave()
  {
    return generador(8,false);
  }


  CifraClave(clave: string)
  {
    return cryptojs.MD5(clave).toString();
  }


  IdentificarPersona(usuario : string, clave : string)
  {
    try{
      let p = this.personaRepositorio.findOne({
        where: {
          correo : usuario,
          clave : clave
        }
      });
      if(p){
        return p;
      }
      return false;
    }catch{
      return false;
    }
  }

  GenerarTokenJWT(persona : Persona)
  {
    let token = jwt.sign({
      data : {
        id : persona.id,
        correo : persona.correo,
        nombre : persona.nombre + '' + persona.apellido
      }
    }, Llaves.claveJWT);
    return token;
  }

  ValidarToken(token:string)
  {
    try{
      let decoded = jwt.verify(token, Llaves.claveJWT)
      return decoded;
    }catch{
      return false;
    }
  }
  
}
