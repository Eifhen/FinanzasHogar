
use master
drop database FinanzasHogar

create database FinanzasHogar
use FinanzasHogar



/******************************************************* 
	USUARIOS 
	tabla que almacena los usuarios de la aplicación
********************************************************/
create table usuarios (
  id_usuario int primary key identity(1,1) not null, -- comienza en 1 e incrementa de 1 en 1
  codigo_usuario UNIQUEIDENTIFIER DEFAULT NEWID(),
  nombre char(20) not null,
  apellidos char(50) not null,
  fecha_nacimiento date not null,
  sexo smallint not null, -- 1 M, 0 F
  email nvarchar(255) not null UNIQUE,
  password char(100) not null,
  fecha_creacion datetime not null,
  estado smallint not null,
  image_public_id nvarchar(max),
  ultimo_login datetime,
  ip_ultimo_login nvarchar(max),
  token_confirmacion nvarchar(max),
  reset_password_token nvarchar(max),
  intentos_fallidos numeric,
  bloqueado_hasta datetime,
  preferencias nvarchar(max), -- Campo para almacenar JSON,
  pais nvarchar(max) not null
);

/******************************************************* 
	HOGARES
	tabla que almacena los hogares creados por un usuario
********************************************************/

create table hogares (
	id_hogar int primary key identity(1,1) not null,
	id_usuario int not null, -- id del usuario que creó el hogar
	nombre char(30) not null,
	descripcion char(100),
	fecha_creacion datetime,
	image_public_id nvarchar(max),
	foreign key (id_usuario) references usuarios(id_usuario)
);

/******************************************************* 
	ROLES
	Esta tabla maneja el listado de los roles del sistema
********************************************************/
create table roles (
	id_rol int primary key identity(1,1) not null,
	nombre_rol char(30) not null,
	descripcion_rol char(100) not null,
	alias char(10),
);

/******************************************************* 
	Usuario Hogar
	Esta tabla maneja la relación entre los usuarios, 
	los hogares y los roles que tienen en cada hogar.
********************************************************/

create table usuario_hogar (
	id int primary key identity(1,1) not null,
	id_usuario int not null, -- Referencia al usuario.
	id_hogar int not null, -- Referencia al hogar
	id_rol int not null, -- Rol del usuario en el hogar.
	fecha_union datetime not null, -- Fecha en que el usuario se unió al hogar.

	foreign key (id_usuario) references usuarios(id_usuario),
	foreign key (id_hogar) references hogares(id_hogar),
	foreign key (id_rol) references roles(id_rol)
);

/******************************************************* 
	Solicitud Hogar
	Tabla que maneja las solicitudes que se hacen 
	para pertenecer a un hogar
********************************************************/

create table solicitud_hogar (
	id_solicitud int primary key identity(1,1) not null,
	id_hogar int not null,
	id_usuario int not null,
	estado_solicitud smallint not null, -- estado de la solicitud 1 = pendiente, 2 = autorizado, 3 = rechazado
	fecha_creacion datetime not null,
	fecha_respuesta datetime,
	token_solicitud nvarchar(max),

	foreign key (id_usuario) references usuarios(id_usuario),
	foreign key (id_hogar) references hogares(id_hogar),
);

/******************************************************* 
	Notificaciones
	Tabla que maneja las notificaciones del sistema
********************************************************/

create table notificaciones (
	id_notificacion int primary key identity(1,1) not null,
	id_usuario int not null, -- id del usuario que recibe la notificación
	mensaje char(100) not null,
	tipo smallint not null, -- 1 system, 2 entity | El tipo de notificación (solicitud, cambios en finanzas, etc.).
	id_entidad_relacionada int, -- id de la entidad relacionada si (si la hay)
	entidad_relacionada nvarchar(max), -- nombre de la entidad relacionada
	estado smallint, -- estado de la notificacion 1 = leida, 0 = noleida
	fecha_creacion datetime,
	fecha_lectura datetime,
	enlace nvarchar(max), -- URL o enlace directo para que el usuario pueda acceder al evento asociado.

	foreign key (id_usuario) references usuarios(id_usuario)
);


/******************************************************* 
	Historial cambios
	Tabla que almacena un log de las operaciones 
	realizadas dentro de un hogar
********************************************************/

create table historial_cambios_hogar (
	id_historial int primary key identity(1,1) not null,
	id_usuario int not null,
	id_hogar int not null,
	entidad nvarchar(max) not null,
	descripcion char(100) not null,
	fecha_cambio datetime not null,

	foreign key (id_usuario) references usuarios(id_usuario),
	foreign key (id_hogar) references hogares(id_hogar)
);


/******************************************************* 
	Categorías
	La tabla de categorías almacenará las diferentes categorías posibles 
	que se pueden utilizar tanto para presupuestos como para gastos.
********************************************************/
create table categorias (
	id_categoria int primary key identity(1,1) not null,
	id_hogar int not null,
	nombre char(100) not null, -- nombre de la categoria: "alimentos" , "transporte" etc
	descripcion char(150),
	tipo smallint not null, -- gasto = 1, ingreso = 2
	
	foreign key (id_hogar) references hogares(id_hogar)
);


/******************************************************* 
	Presupuesto
	El presupuesto contendrá un límite global y estará 
	asociado a múltiples categorías a través de una 
	tabla intermedia.
********************************************************/
create table presupuestos (
	id_presupuesto int primary key identity(1,1) not null,
	id_hogar int not null,
	nombre char(60) not null,
	descripcion char(200) not null,
	monto_maximo decimal(10, 2), -- monto máximo global del presupuesto
	periodo smallint, -- intervalo de tiempo del presupuesto: 1 = semanal, 2 = mensual, 3 = anual
	fecha_inicio date not null,
	fecha_fin date, -- opcional en un presupuesto a plazo fijo

	foreign key (id_hogar) references hogares(id_hogar)
);

/******************************************************* 
	Presupuesto  Categoria
	Esta tabla intermedia conectará cada presupuesto 
	con las categorías que cubre y el monto asignado 
	para cada categoría.
********************************************************/
create table presupuesto_categoria (
	id int primary key identity(1,1) not null,
	id_presupuesto int not null,
	id_categoria int not null,
	monto_maximo decimal(10, 2),

	foreign key (id_presupuesto) references presupuestos(id_presupuesto),
	foreign key (id_categoria) references categorias(id_categoria)
);


/******************************************************* 
	Cuentas
	Esta tabla intermedia conectará cada presupuesto 
	con las categorías que cubre y el monto asignado 
	para cada categoría.
********************************************************/

create table cuentas (
	id_cuenta int primary key identity(1,1) not null,
	id_hogar int not null,
	nombre char(100) not null,
	tipo smallint not null, -- tipo de cuenta : 1 = bancaria, 2 = efectivo, 3 = tarjeta_credito, 4 = inversion, 5 = prestamo
	saldo_inicial decimal(10, 2), -- saldo con el que se abrió la cuenta
	saldo_actual decimal(10, 2), -- saldo actualizado de la cuenta
	moneda char(3), -- codigo de la moneda ej: USD, RD, EUR
	fecha_creacion datetime,
	estado smallint -- 1 activo, 2 inactivo, 3 cerrada

	foreign key (id_hogar) references hogares(id_hogar)
);

/******************************************************* 
	Transacciones
	tabla que simplifica el manejo de los ingresos y gastos
********************************************************/

create table transacciones (
	id_transaccion int primary key identity(1,1) not null,
	id_cuenta int not null, -- cuenta a la que pertenece la transacción
	id_hogar int not null, -- hogar al que pertenece esta transacción
	id_categoria int, -- Clasificación de la transacción (e.g., "Alimentos", "Salario").
	fecha datetime not null, -- fecha en la que ocurrió la transacción
	monto decimal(10, 2) not null, -- monto de la transacción
	descripcion char(150), 
	tipo smallint -- tipo de transaccion; 1 = ingreso, 2 = gasto

	foreign key (id_hogar) references hogares(id_hogar),
	foreign key (id_cuenta) references cuentas(id_cuenta),
	foreign key (id_categoria) references categorias(id_categoria)
);

/******************************************************* 
	Metas
	Las metas permiten a los usuarios definir un objetivo 
	financiero específico (por ejemplo, comprar un coche, 
	hacer un viaje, o crear un fondo de emergencia) y 
	registrar ahorros que contribuyan a esa meta.
********************************************************/

create table metas (
	id_meta int primary key identity(1,1) not null,
	id_hogar int not null,
	nombre char(50) not null,
	descripcion char(200) not null,
	monto_objetivo decimal(10, 2) not null,
	monto_ahorrado decimal(10, 2) not null,
	fecha_limite datetime,
	image_public_id nvarchar(max),
	foreign key (id_hogar) references hogares(id_hogar)
);

/******************************************************* 
	Ahorros
	Los ahorros representarían el dinero que los usuarios deciden apartar de sus 
	ingresos para un propósito particular. 
	Estos ahorros pueden estar vinculados a una o más metas 
	específicas o simplemente estar guardados como reserva general.
********************************************************/

create table ahorros (
	id_ahorro int primary key identity(1,1) not null,
	id_hogar int not null,
	id_meta int not null,
	id_cuenta int,
	monto decimal(10, 2) not null,
	descripcion char(100) not null,
	fecha datetime not null,

	foreign key (id_hogar) references hogares(id_hogar),
	foreign key (id_meta) references metas(id_meta),
	foreign key (id_cuenta) references cuentas(id_cuenta)
);

/******************************************************* 
	Deuda
	Las deudas pueden manejarse de forma similar a los 
	ahorros o gastos, pero necesitan detalles adicionales, 
	como el acreedor, el saldo pendiente, las cuotas, y los intereses. 
	Además, las deudas pueden estar asociadas a cuentas 
	bancarias o tarjetas de crédito dentro del hogar.
********************************************************/
create table deudas (
	id_deuda int primary key identity(1,1) not null,
	id_cuenta int not null,
	id_hogar int not null,
	acreedor char(50), -- nombre del acreedor banco o persona
	monto_inicial decimal(10, 2) not null,
	monto_pendiente decimal(10, 2) not null,
	interes decimal(5, 2) not null,
	fecha_inicio datetime not null,
	fecha_vencimiento datetime,
	cuotas_totales smallint,
	cuotas_restantes smallint,
	descripcion char(100) not null

	foreign key (id_hogar) references hogares(id_hogar),
	foreign key (id_cuenta) references cuentas(id_cuenta),
);

/******************************************************* 
	Pagos Deuda
	Cada vez que el usuario realiza un pago para disminuir 
	una deuda, ese pago debe registrarse y reflejarse 
	en el saldo pendiente.
********************************************************/
create table pagos_deuda (
	id_pagos_deuda int primary key identity(1,1) not null,
	id_deuda int not null,
	id_cuenta int,
	monto decimal(10, 2) not null,
	fecha_pago datetime not null,

	foreign key (id_deuda) references deudas(id_deuda),
	foreign key (id_cuenta) references cuentas(id_cuenta),
);
