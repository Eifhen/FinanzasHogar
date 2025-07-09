

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

-------------------------------------------------------------


BEGIN TRANSACTION

DROP TABLE gj_tenant_connections;

ALTER TABLE gj_tenant_details DROP COLUMN connectionObject;

ALTER TABLE gj_tenant_details DROP COLUMN databaseName;

ALTER TABLE gj_tenant_details DROP COLUMN connectionString;

ALTER TABLE gj_tenants DROP COLUMN database_type

ALTER TABLE gj_tenant_connections ADD COLUMN database_type TEXT;

ALTER TABLE gj_tenant_connections ALTER COLUMN database_type SET NOT NULL;


----------------------------------------------------------------
-- PERSONAL = 0b7bb829-745e-4a16-9feb-04c0a8aa61b1;

INSERT INTO gj_tenant_connections (
  tenant_key,
  database_type,
  connection,
  timeout,
  pool_min,
  pool_max
)
VALUES(
  '0b7bb829-745e-4a16-9feb-04c0a8aa61b1',
  'postgres_sql_database',
  'eyJpdiI6Imcvak1ROGV5Q2tlRDhiUFpOcEE4SFE9PSIsInZhbHVlIjoiSzFpL3Z5cXdITEdpaDhZelI5ZU9reUlqN1ZRcnNwbzdsNDJhdUJHeUVmNmptU1IvVEgya2pjTFJrU1RrVFdmOEIzbmwvMVVEbWExMkQ2clhFaE52RTlYNXpIL056aTE5b0lsUjA4OXk1VkZwRURka1N1am82L0pnbVIveW5pM2tuSk9WZjlmTGM3NjVvdUVub3lBanpWQXZ4YUc4b3FGTGFOcms1YWcvQ0F3PSJ9',
  5000, -- 5s
  1,
  10
);


----------------------------------------------------------------
SELECT * FROM gj_proyects;
SELECT * FROM gj_tenants;
SELECT * FROM gj_tenant_details;
SELECT * FROM gj_tenant_connections;

COMMIT TRANSACTION;

-- ROLLBACK TRANSACTION;

UPDATE gj_tenant_connections
SET 
  connection = 'eyJpdiI6Ikg3NnlLSUc3R0pLa1g5SE9ZSy9IdHc9PSIsInZhbHVlIjoiUS9wZVhMOHArMkd6NGU2cHpCM2VmZUhBK1F5VXFlQ1BnRkNLUTZSTVFuV0VBZ1Y1dGUxNWl5aDJGM0EwbnhZUENNSzdyWUpSN1JuQWh3clppY0k0Vm1SVlBtVjFSQlV5TE9OUmMwQkJ5aURRN1hvU0pIcTZ3NWJFUUpoVHp2bFdTenRFVUE1RnUvUmc2ZjlWUVo0OW84M3FvRU1NU0xPZStnaU1tdW5iZlNNPSJ9',
  database_type = 'ms_sql_database' -- "ms_sql_database" | "postgres_sql_database" | "mongo_database"
WHERE id = 1;



SELECT * FROM gj_tenants;
SELECT * FROM gj_tenants OFFSET 2 LIMIT 1;