import { Kysely } from "kysely";
import { AhorrosTable } from "../../Dominio/Entities/Ahorros";
import { CategoriasTable } from "../../Dominio/Entities/Categorias";
import { CuentasTable } from "../../Dominio/Entities/Cuentas";
import { DeudasTable } from "../../Dominio/Entities/Deudas";
import { HistorialCambiosHogarTable } from "../../Dominio/Entities/HistorialCambiosHogar";
import { HogaresTable } from "../../Dominio/Entities/Hogares";
import { MetasTable } from "../../Dominio/Entities/Metas";
import { NotificacionesTable } from "../../Dominio/Entities/Notificaciones";
import { PagosDeudaTable } from "../../Dominio/Entities/PagosDeuda";
import { PresupuestoCategoriaTable } from "../../Dominio/Entities/PresupuestoCategoria";
import { PresupuestosTable } from "../../Dominio/Entities/Presupuestos";
import { RolesTable } from "../../Dominio/Entities/Roles";
import { SolicitudHogarTable } from "../../Dominio/Entities/SolicitudHogar";
import { TransaccionesTable } from "../../Dominio/Entities/Transacciones";
import { UsuariosHogarTable } from "../../Dominio/Entities/UsuarioHogar";
import { UsuariosTable } from "../../Dominio/Entities/Usuarios";


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