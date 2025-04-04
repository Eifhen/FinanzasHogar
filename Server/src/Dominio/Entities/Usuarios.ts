import { Generated, Insertable, JSONColumnType, Selectable, Updateable } from "kysely";
import { EstadosUsuario } from "../../JFramework/Utils/estados";
import { ApplicationLenguage } from "../../JFramework/Translations/Types/ApplicationLenguages";
import { ApplicationThemes } from "../../JFramework/Utils/Types/CommonTypes";


/** Tipo que representa las preferencias de un usuario */
export type UserPreferences = {
  lan: ApplicationLenguage;
  theme: ApplicationThemes;
}


/** Esta interfaz represeta el esquema de la tabla de usuarios */
export interface UsuariosTable {

  /** Id secuencial del usuario */
  id_usuario?: Generated<number>;

  /** Codigo de usuario */
  codigo_usuario: Generated<string>;

  /**Nombre del usuario */
  nombre:string;

  /** Apellidos del usuario del usuario */
  apellidos: string;

  /** Fecha de nacimiento del usuario */
  fecha_nacimiento: Date;

  /** Sexo del usuario true = M | false = F*/
  sexo: boolean; 

  /** Email del usuario */
  email: string;

  /** Cotraseña del usuario */
  password: string;

  /** 
    #### Fecha de creación del usuario 
    You can specify a different type for each operation (select, insert and update) 
    using the `ColumnType<SelectType, InsertType, UpdateType>` wrapper. 
    Here we define a column `created_at` that is selected as a `Date`, 
    can optionally be provided as a `string` in inserts and
    can never be updated:
  */
  fecha_creacion: Date;


  /** 
   * Estado del usuario: 
   * 1= ACTIVO, 
   * 2= INACTIVO, 
   * 3= BLOQUEADO, 
   * 4= ELIMINADO 
  */
  estado: EstadosUsuario;

  /** Id de la Url de la foto del usuario */
  image_public_id?: string;

  /** Fecha del último login del usuario */
  ultimo_login?: Date;

  /** Dirección IP del último login del usuario */
  ip_ultimo_login?: string;

  /** Token de confirmación del usuario */
  token_confirmacion?: string;

  /** Token para resetear contraseña del usuario */
  reset_password_token?: string;

  /** 
  * Controla el numero de intentos fallidos del usuario al 
  * intentar entrar a la plataforma 
  */
  intentos_fallidos?: number;

  /** Fecha de fin de bloqueo del usuario */
  bloqueado_hasta?: Date;

  /** País del usuario */
  pais: string;

  /** 
    #### Preferencias del usuario 
    You can specify JSON columns using the `JSONColumnType` wrapper.
    It is a shorthand for `ColumnType<T, string, string>`, where T
    is the type of the JSON object/array retrieved from the database,
    and the insert and update types are always `string` since you're
    always stringifying insert/update values. 
  */
  preferencias?: JSONColumnType<UserPreferences, string, string>
}



/**  
  You should not use the table schema interfaces directly. Instead, you should
  use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
  make sure that the correct types are used in each operation.

  Most of the time you should trust the type inference and not use explicit
  types at all. These types can be useful when typing function arguments. 
*/

/** Tipo para realizar consultas de seleccion */
export type SelectUsuarios = Selectable<UsuariosTable>;

/** Tipo para realizar consultas de inserción */
export type CreateUsuarios = Insertable<Omit<UsuariosTable, "id_usuario">>;

/** Tipo para realizar consultas de actualización */
export type UpdateUsuarios = Updateable<Omit<UsuariosTable, "id_usuario">>;