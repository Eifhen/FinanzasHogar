import { Kysely } from "kysely";
import { UsuariosTable } from "../../Dominio/Entities/Usuarios";


export interface DataBase {
  usuarios: UsuariosTable;
}

export type ApplicationSQLDatabase = Kysely<DataBase>;