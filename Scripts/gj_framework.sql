

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
	style_parameters nvarchar(max), -- almacena parámetros de estilo en formato JSON
	logo nvarchar(max), -- ruta del logo del cliente
);



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


select * from gj_proyects;

delete from gj_proyects;


-- Insertar tenants en la tabla gj_tenants usando los proyect_key generados
INSERT INTO gj_tenants (
	proyect_key,
	tenant_key,
	name, 
	description, 
	database_type, 
	status, 
	creation_date
)
VALUES
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0B7BB829-745E-4A16-9FEB-04C0A8AA61B1', 'PERSONAL', 'implementación de HomeBudget para uso personal', 'ms_sql_database', 1, GETDATE()),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '6BD09220-3143-4BAF-B7E4-3495C843B7B4', 'Cliente Z', 'Cliente de condominio que quiere administrar finanzas de hogar', 'ms_sql_database', 0, GETDATE()),
('F6902E91-8A64-4EAE-96BD-60EAE1E4B584', '0202417F-1806-4A8C-8301-70E2B2CC3E9D','Cliente Y', 'Cliente del sector salud que quiere administrar finanzas de hogar', 'mongo_database', 1, GETDATE());


select * from gj_tenants;

delete from gj_tenants;


INSERT INTO gj_tenant_details (
	tenant_key, -- key de gj_clients
	databaseName, -- nombre de la base de datos
	connectionString, -- permite conectar a la base de datos del cliente
	style_parameters, -- almacena parámetros de estilo en formato JSON
	logo, -- ruta del logo del cliente
) values ()

select * from gj_tenant_details;

delete from gj_tenant_details;