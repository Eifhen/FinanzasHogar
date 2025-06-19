

/*****************************************************************************************
####### INSERTS ##########################################################################
******************************************************************************************/

-- Insertar proyectos en la tabla gj_proyects
INSERT INTO gj_proyects (
	proyect_key,
	name, 
	description, 
	creation_date, 
	status
)
VALUES 
(
  'F6902E91-8A64-4EAE-96BD-60EAE1E4B584',
  'HomeBudget', 
  'Sistema de gestión de finanzas del hogar', 
  CURRENT_DATE, 
  1
);


/** PROJ-FH-000000000001 */
-- Insertar tenants en la tabla gj_tenants usando los proyect_key generados
INSERT INTO gj_tenants (
	proyect_key,
	tenant_key,
	tenant_code,
	name, 
	description, 
	database_type, 
	status, 
	creation_date
)
VALUES
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0B7BB829-745E-4A16-9FEB-04C0A8AA61B1', 'PROJ-FH-000000000001', 'PERSONAL', 'implementación de HomeBudget para uso personal', 'ms_sql_database', 1, CURRENT_DATE),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '6BD09220-3143-4BAF-B7E4-3495C843B7B4', 'PROJ-FH-000000000002', 'Cliente Z', 'Cliente de condominio que quiere administrar finanzas de hogar', 'ms_sql_database', 0, CURRENT_DATE),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0202417F-1806-4A8C-8301-70E2B2CC3E9D', 'PROJ-FH-000000000003', 'Cliente Y', 'Cliente del sector salud que quiere administrar finanzas de hogar', 'mongo_database', 1, CURRENT_DATE);


INSERT INTO gj_tenant_details (
	tenant_key, -- key de gj_clients
	databaseName, -- nombre de la base de datos
	connectionString, -- permite conectar a la base de datos del cliente
	connectionObject, -- almacena datos de conexión en formato JSON
	style_parameters, -- almacena parámetros de estilo en formato JSON
	logo -- ruta del logo del cliente
) VALUES (
'0B7BB829-745E-4A16-9FEB-04C0A8AA61B1', 
'FinanzasHogar', 
'', 
'{
	"userName": "eifhen",
	"password": "thetrue123",
	"domain": "JIMENEZG",
	"server": "JIMENEZG",
	"databaseName": "FinanzasHogar",
	"databasePort": 1433,
	"instanceName": "MSSQLSERVER",
	"connectionTimeout": 3000,
	"connectionPoolMinSize": 1,
	"connectionPoolMaxSize": 10
}', 
'{}',
'https://res.cloudinary.com/deeho16gc/image/upload/v1738149910/HomeBudget_nebkjj.png'
);



SELECT * FROM gj_tenants;
DELETE FROM gj_tenants;

SELECT * FROM gj_tenant_details;
DELETE FROM gj_tenant_details;

SELECT * FROM gj_proyects;
DELETE FROM gj_proyects;