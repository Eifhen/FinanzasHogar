

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
	proyect_key UNIQUEIDENTIFIER DEFAULT NEWID(),
	name char(20),
	description varchar(60),
	creation_date datetime,
	status smallint -- active = 1, inactive = 0
);

/*
	Tabla de clientes, contiene los clientes que actualmente contienen una implementación de 
	los proyectos del framework, por cada cliente se creará una base de datos distinta del proyecto.
*/
create table gj_clients (
	id int primary key identity(1,1) not null,
	proyect_key UNIQUEIDENTIFIER not null, -- key de gj_proyects
	client_key UNIQUEIDENTIFIER DEFAULT NEWID() not null,
	name char(20) not null,
	description varchar(60),
	status smallint, -- active = 1, inactive = 0
	creation_date datetime
);

/*
	Tabla de detalle de clientes, contiene información adicional 
	acerca de los clientes registrados.
*/
create table gj_client_details (
	id int primary key identity(1, 1) not null,
	client_key UNIQUEIDENTIFIER not null, -- key de gj_clients
	databaseName varchar(max), -- nombre de la base de datos
	connectionString varchar(max), -- permite conectar a la base de datos del cliente
	style_parameters nvarchar(max), -- almacena parámetros de estilo en formato JSON
	logo nvarchar(max), -- ruta del logo del cliente
);