

DROP DATABASE gj_framework;
CREATE DATABASE gj_framework;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



BEGIN TRANSACTION;

/******************************************************* 
	Tabla de proyects
	Contiene un listado de los proyectos que trabajan con el framework.
********************************************************/
CREATE TABLE gj_proyects (
	id SERIAL PRIMARY KEY NOT NULL,
	proyect_key UUID DEFAULT uuid_generate_v4() NOT NULL, -- token/key del proyecto
	name CHAR(100) NOT NULL, -- nombre del proyecto
	description TEXT, -- descripción del proyecto
	creation_date TIMESTAMP NOT NULL, -- fecha de creación del proyecto
	status SMALLINT NOT NULL -- active = 1, inactive = 0
);

/******************************************************* 
	Tabla de clientes/Tenants, 
  contiene los clientes que actualmente contienen una 
  implementación de los proyectos del framework, por cada 
  cliente se creará una base de datos distinta del proyecto.
********************************************************/
CREATE TABLE gj_tenants (
	id SERIAL PRIMARY KEY NOT NULL,
	proyect_key UUID NOT NULL, -- UUID key de gj_proyects
	tenant_key UUID DEFAULT uuid_generate_v4() NOT NULL,
	tenant_code CHAR(20) UNIQUE NOT NULL, -- ej: PROJ-FH-000000000001
	name CHAR(200) NOT NULL, -- nombre del cliente
	description TEXT, -- descripcion del cliente
	status SMALLINT NOT NULL, -- active = 1, inactive = 0,
	domain TEXT, -- nombre del dominio del tenant 
	creation_date TIMESTAMP NOT NULL -- fecha de creación del cliente
  	-- database_type TEXT NOT NULL, -- tipo de base de datos ( "ms_sql_database" | "postgres_sql_database" | "mongo_database")
);

/******************************************************* 
	Tabla de detalle de clientes, contiene información adicional 
	acerca de los clientes registrados.
********************************************************/
CREATE TABLE gj_tenant_details (
	id SERIAL PRIMARY KEY NOT NULL,
	tenant_key UUID UNIQUE NOT NULL, -- key de gj_tenants
	connectionString TEXT, -- permite conectar a la base de datos del cliente
  style_parameters JSON, -- almacena parámetros de estilo en formato JSON
	logo TEXT -- ruta del logo del cliente
	-- databaseName TEXT, -- eliminado, ahora solo se usa el connectionString | nombre de la base de datos 
	-- connectionObject JSON, -- Columna eliminada, solo se usará el connectionString | objeto de conexión en formato JSON

);

/******************************************************* 
	Tabla de conexión de clientes, contiene información acerca  
	de la configuración de conexión de los clientes registrados
********************************************************/
CREATE TABLE gj_tenant_connections (
  id SERIAL PRIMARY KEY NOT NULL, 
  tenant_key UUID UNIQUE NOT NULL, -- Key del gj_tenant
  database_type TEXT NOT NULL, -- tipo de base de datos ("ms_sql_database" | "postgres_sql_database" | "mongo_database")
  connection TEXT, -- Cadena de conexión del tenant
  timeout INT, -- connectionTimeout de la conexión a la base de datos
  pool_min smallint, -- tamaño minimo del pool
  pool_max smallint -- tamaño máximo del pool
);


--------------------------------------- [ VISTAS ] ------------------------------------

/***********************************************
  Vista que muestra la información del tenant y los 
  datos de conexión del tenant
************************************************/
CREATE OR REPLACE VIEW gj_tenant_connection_view AS (
  SELECT 
    t.id AS tenant_id,
    t.proyect_key AS proyect_key,
    t.tenant_key AS tenant_key,
    t.tenant_code AS tenant_code,
    t.name AS name,
    t.description AS descripcion,
    t.status AS status,
    t.domain AS domain,
    t.creation_date AS creation_date,
    tc.id AS tenant_connection_id,
    tc.database_type AS database_type,
    tc.connection AS connection,
    tc.timeout AS timeout,
    tc.pool_min AS pool_min,
    tc.pool_max AS pool_max
  FROM gj_tenants t
  JOIN gj_tenant_connections tc ON t.tenant_key = tc.tenant_key
);


SELECT * FROM gj_tenant_connection_view;

SELECT * FROM gj_tenant_connections tc;


----------------------------------------------------------------
SELECT * FROM gj_proyects;
SELECT * FROM gj_tenants;
SELECT * FROM gj_tenant_details;
SELECT * FROM gj_tenant_connections;