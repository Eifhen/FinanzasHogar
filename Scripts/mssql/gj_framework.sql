

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
	name char(20) not null, -- nombre del cliente
	description varchar(max), -- descripcion del cliente
	database_type varchar(max), -- tipo de base de datos ( "ms_sql_database" | "mongo_database")
	status smallint, -- active = 1, inactive = 2,
	domain varchar(max), -- nombre del dominio del tenant 
	creation_date datetime -- fecha de creación del cliente
);

/*
	Tabla de detalle de clientes, contiene información adicional 
	acerca de los clientes registrados.
*/
create table gj_tenant_details (
	id int primary key identity(1, 1) not null,
	tenant_key UNIQUEIDENTIFIER UNIQUE not null, -- key de gj_clients
	databaseName varchar(max), -- nombre de la base de datos
	connectionString varchar(max), -- permite conectar a la base de datos del cliente
	connectionObject nvarchar(max) CHECK (ISJSON(connectionObject) > 0),
	style_parameters nvarchar(max) CHECK (ISJSON(style_parameters) > 0), -- almacena parámetros de estilo en formato JSON
	logo nvarchar(max), -- ruta del logo del cliente
);



