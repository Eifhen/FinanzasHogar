import { Kysely } from "kysely";
import { UsuariosTable } from "../Dominio/Entities/Usuarios";
import { UsuariosHogarTable } from "../Dominio/Entities/UsuarioHogar";
import { HogaresTable } from "../Dominio/Entities/Hogares";
import { SolicitudHogarTable } from "../Dominio/Entities/SolicitudHogar";
import { NotificacionesTable } from "../Dominio/Entities/Notificaciones";
import { RolesTable } from "../Dominio/Entities/Roles";
import { HistorialCambiosHogarTable } from "../Dominio/Entities/HistorialCambiosHogar";
import { CategoriasTable } from "../Dominio/Entities/Categorias";
import { PresupuestosTable } from "../Dominio/Entities/Presupuestos";
import { PresupuestoCategoriaTable } from "../Dominio/Entities/PresupuestoCategoria";
import { CuentasTable } from "../Dominio/Entities/Cuentas";
import { TransaccionesTable } from "../Dominio/Entities/Transacciones";
import { MetasTable } from "../Dominio/Entities/Metas";
import { AhorrosTable } from "../Dominio/Entities/Ahorros";
import { DeudasTable } from "../Dominio/Entities/Deudas";
import { PagosDeudaTable } from "../Dominio/Entities/PagosDeuda";


/** Modelo de base de datos */
export interface DataBase {
  usuarios: UsuariosTable;
  usuariosHogar: UsuariosHogarTable;
  hogares: HogaresTable;
  solicitudHogar: SolicitudHogarTable;
  notificaciones: NotificacionesTable;
  roles: RolesTable;
  historialCambiosHogar: HistorialCambiosHogarTable;
  categorias: CategoriasTable,
  presupuestos: PresupuestosTable,
  presupuestoCategoria: PresupuestoCategoriaTable,
  cuentas: CuentasTable,
  transacciones: TransaccionesTable,
  metas: MetasTable,
  ahorros: AhorrosTable,
  deudas: DeudasTable,
  pagosDeuda: PagosDeudaTable,
}


/** Tipo que representa una base de datos SQl de kysely */
export type ApplicationSQLDatabase = Kysely<DataBase>;