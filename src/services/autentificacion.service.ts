import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { PedidoRepository, PersonaRepository } from '../repositories';

const generador = require('password-generator');
const cryptojs = require('crypto-js');
///const jwt = require('')
@injectable({scope: BindingScope.TRANSIENT})
export class AutentificacionService {
  constructor(
    @repository(PedidoRepository)
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


  IdentificacionPersona(usuario:string, clave: string)
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


  
}
