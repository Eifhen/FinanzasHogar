
use master
use gj_framework;

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
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584','HomeBudget', 'Sistema de gestión de finanzas del hogar', GETDATE(), 1);


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
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0B7BB829-745E-4A16-9FEB-04C0A8AA61B1', 'PROJ-FH-000000000001', 'PERSONAL', 'implementación de HomeBudget para uso personal', 'ms_sql_database', 1, GETDATE()),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '6BD09220-3143-4BAF-B7E4-3495C843B7B4', 'PROJ-FH-000000000002', 'Cliente Z', 'Cliente de condominio que quiere administrar finanzas de hogar', 'ms_sql_database', 0, GETDATE()),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0202417F-1806-4A8C-8301-70E2B2CC3E9D', 'PROJ-FH-000000000003', 'Cliente Y', 'Cliente del sector salud que quiere administrar finanzas de hogar', 'mongo_database', 1, GETDATE());


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



select * from gj_tenants;
delete from gj_tenants;

select * from gj_tenant_details;
delete from gj_tenant_details;

select * from gj_proyects;
delete from gj_proyects;

--------------------------------------------------------

DROP TABLE gj_tenant_connections;

use gj_framework;

BEGIN TRANSACTION 

ALTER TABLE gj_tenant_details DROP COLUMN databaseName;

ALTER TABLE gj_tenant_details DROP COLUMN connectionObject;

ALTER TABLE gj_tenant_details DROP COLUMN connectionString;

ALTER TABLE gj_tenants DROP COLUMN database_type;

ALTER TABLE gj_tenant_connections ADD COLUMN database_type TEXT;

ALTER TABLE gj_tenant_connections ALTER COLUMN database_type SET NOT NULL;

---------------------------------------------------------
-- PERSONAL = 0B7BB829-745E-4A16-9FEB-04C0A8AA61B1;

INSERT INTO gj_tenant_connections (
  tenant_key,
  database_type,
  connection,
  timeout,
  pool_min,
  pool_max
)
VALUES(
  '0B7BB829-745E-4A16-9FEB-04C0A8AA61B1',
  'ms_sql_database',
  'eyJpdiI6ImNJZzR6VFhjTnJQV3F6N01yeUtNdkE9PSIsInZhbHVlIjoibG5TZU5xeWtQejJ1K1pGREpJSzlsVHNhdGwzZG5JY0U1djcxUU1ZZ3NZcnlwd3ZZSlpCT29UT0Zza2xkM0dmNlhJNVQvOGpHekJ0WWN3c0s5Z3hEMnNhM05aVFlYckxjUmx3Z2ZlcS8zOEIxR3c0ektvNHRqUzY1ZktSQk8xVXBLMU0wUVVIZ1BLTkNFakl6cDNRKzZQMzhqeWc1WVNTKzliZEtzMmhXakFRPSJ9eyJpdiI6ImNJZzR6VFhjTnJQV3F6N01yeUtNdkE9PSIsInZhbHVlIjoibG5TZU5xeWtQejJ1K1pGREpJSzlsVHNhdGwzZG5JY0U1djcxUU1ZZ3NZcnlwd3ZZSlpCT29UT0Zza2xkM0dmNlhJNVQvOGpHekJ0WWN3c0s5Z3hEMnNhM05aVFlYckxjUmx3Z2ZlcS8zOEIxR3c0ektvNHRqUzY1ZktSQk8xVXBLMU0wUVVIZ1BLTkNFakl6cDNRKzZQMzhqeWc1WVNTKzliZEtzMmhXakFRPSJ9',
  5000, -- 5s
  1,
  10
)

---------------------------------------------------------
use gj_framework;

SELECT * FROM gj_proyects;
SELECT * FROM gj_tenants;
SELECT * FROM gj_tenant_details;
SELECT * FROM gj_tenant_connections;



select * from gj_tenant_connection_view;

COMMIT TRANSACTION
-- ROLLBACK TRANSACTION


UPDATE gj_tenant_connections 
SET connection = 'eyJpdiI6Ikg3NnlLSUc3R0pLa1g5SE9ZSy9IdHc9PSIsInZhbHVlIjoiUS9wZVhMOHArMkd6NGU2cHpCM2VmZUhBK1F5VXFlQ1BnRkNLUTZSTVFuV0VBZ1Y1dGUxNWl5aDJGM0EwbnhZUENNSzdyWUpSN1JuQWh3clppY0k0Vm1SVlBtVjFSQlV5TE9OUmMwQkJ5aURRN1hvU0pIcTZ3NWJFUUpoVHp2bFdTenRFVUE1RnUvUmc2ZjlWUVo0OW84M3FvRU1NU0xPZStnaU1tdW5iZlNNPSJ9'
WHERE id = 2;