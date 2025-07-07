

use master
drop database gj_framework

create database gj_framework;
use gj_framework;

/*
	Tabla de proyects
	Contiene un listado de los proyectos que trabajan con el framework.
*/
create table gj_proyects (

	id int primary key identity(1,1) not null,
	proyect_key UNIQUEIDENTIFIER UNIQUE DEFAULT NEWID(), -- token/key del proyecto
	name char(20), -- nombre del proyecto
	description varchar(60), -- descripción del proyecto
	creation_date datetime, -- fecha de creación del proyecto
	status smallint -- active = 1, inactive = 0
);

/*
	Tabla de clientes/Tenants, contiene los clientes que actualmente contienen una implementación de 
	los proyectos del framework, por cada cliente se creará una base de datos distinta del proyecto.
*/
create table gj_tenants (
	id int primary key identity(1,1) not null,
	proyect_key UNIQUEIDENTIFIER not null, -- key de gj_proyects
	tenant_key UNIQUEIDENTIFIER UNIQUE DEFAULT NEWID() not null,
	tenant_code char(20) UNIQUE not null,
	name varchar(max) not null, -- nombre del cliente
	description varchar(max), -- descripcion del cliente
	status smallint, -- active = 1, inactive = 2,
	domain varchar(max), -- nombre del dominio del tenant 
	creation_date datetime -- fecha de creación del cliente
	-- database_type varchar(max), -- tipo de base de datos ( "ms_sql_database" | "mongo_database" | "postgres_sql_database")
);


/*
	Tabla de detalle de clientes, contiene información adicional 
	acerca de los clientes registrados.
*/
create table gj_tenant_details (
	id int primary key identity(1, 1) not null,
	tenant_key UNIQUEIDENTIFIER UNIQUE not null, -- key de gj_tenants
	style_parameters nvarchar(max) CHECK (ISJSON(style_parameters) > 0), -- almacena parámetros de estilo en formato JSON
	logo nvarchar(max), -- ruta del logo del cliente
	-- connectionString varchar(max), -- permite conectar a la base de datos del cliente
	-- databaseName varchar(max), -- nombre de la base de datos
	-- connectionObject nvarchar(max) CHECK (ISJSON(connectionObject) > 0), -- Columna eliminada, solo se usará el connectionString |
);

/******************************************************* 
	Tabla de conexión de clientes, contiene información acerca  
	de la configuración de conexión de los clientes registrados
********************************************************/
CREATE TABLE gj_tenant_connections (
  id INT PRIMARY KEY IDENTITY(1,1) NOT NULL, 
  tenant_key UNIQUEIDENTIFIER UNIQUE NOT NULL, -- Key del gj_tenant
  database_type VARCHAR(MAX) NOT NULL, -- tipo de base de datos ( "ms_sql_database" | "postgres_sql_database" | "mongo_database")
  connection VARCHAR(MAX), -- Cadena de conexión del tenant
  timeout INT, -- connectionTimeout de la conexión a la base de datos
  pool_min smallint, -- tamaño minimo del pool
  pool_max smallint -- tamaño máximo del pool
)

--------------------------------------- [ VISTAS ] ------------------------------------

/***********************************************
  Vista que muestra la información del tenant y los 
  datos de conexión del tenant
************************************************/
CREATE VIEW gj_tenant_connection_view AS (
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

