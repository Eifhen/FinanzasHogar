

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
	database_type TEXT NOT NULL, -- tipo de base de datos ( "ms_sql_database" | "mongo_database")
	status SMALLINT NOT NULL, -- active = 1, inactive = 0,
	domain TEXT, -- nombre del dominio del tenant 
	creation_date TIMESTAMP NOT NULL -- fecha de creación del cliente
);

/******************************************************* 
	Tabla de detalle de clientes, contiene información adicional 
	acerca de los clientes registrados.
********************************************************/
CREATE TABLE gj_tenant_details (
	id SERIAL PRIMARY KEY NOT NULL,
	tenant_key UUID UNIQUE NOT NULL, -- key de gj_tenants
	databaseName TEXT, -- nombre de la base de datos
	connectionString TEXT, -- permite conectar a la base de datos del cliente
	connectionObject JSON, -- objeto de conexión en formato JSON
	style_parameters JSON, -- almacena parámetros de estilo en formato JSON
	logo TEXT -- ruta del logo del cliente
);

COMMIT TRANSACTION;

-- ROLLBACK TRANSACTION;