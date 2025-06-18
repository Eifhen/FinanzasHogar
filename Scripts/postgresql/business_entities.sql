


DROP DATABASE finanzas_hogar;
CREATE DATABASE finanzas_hogar;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN TRANSACTION;
  
/******************************************************* 
	USUARIOS 
	tabla que almacena los usuarios de la aplicación
********************************************************/
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY NOT NULL,
  codigo_usuario UUID DEFAULT uuid_generate_v4(),
  nombre CHAR(20) NOT NULL,
  apellidos CHAR(50) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo SMALLINT NOT NULL, -- 1 M | 0 F
  email VARCHAR(200) NOT NULL UNIQUE,
  password CHAR(100) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL,
  estado SMALLINT NOT NULL,
  image_public_id TEXT,
  ultimo_login TIMESTAMP,
  ip_ultimo_login TEXT,
  token_confirmacion TEXT,
  reset_password_token TEXT,
  intentos_fallidos INT,
  bloqueado_hasta TIMESTAMP,
  preferencias JSON,
  pais TEXT
);

/******************************************************* 
	HOGARES
	tabla que almacena los hogares creados por un usuario
********************************************************/
CREATE TABLE IF NOT EXISTS hogares (
	id_hogar SERIAL PRIMARY KEY NOT NULL,
	id_usuario INT NOT NULL, -- id del usuario que creó el hogar
	nombre CHAR(30) NOT NULL,
	descripcion CHAR(100),
	fecha_creacion TIMESTAMP,
	image_public_id TEXT,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

/******************************************************* 
	ROLES
	Esta tabla maneja el listado de los roles del sistema
********************************************************/
CREATE TABLE IF NOT EXISTS roles (
	id_rol SERIAL PRIMARY KEY NOT NULL,
	nombre_rol CHAR(130) NOT NULL,
	descripcion_rol CHAR(100) NOT NULL,
	alias CHAR(10)
);

/******************************************************* 
	Usuario Hogar
	Esta tabla maneja la relación entre los usuarios, 
	los hogares y los roles que tienen en cada hogar.
********************************************************/
CREATE TABLE IF NOT EXISTS usuario_hogar (
	id SERIAL PRIMARY KEY NOT NULL,
	id_usuario INT NOT NULL, -- Referencia al usuario.
	id_hogar INT NOT NULL, -- Referencia al hogar
	id_rol INT NOT NULL, -- Rol del usuario en el hogar.
	fecha_union TIMESTAMP NOT NULL, -- Fecha en que el usuario se unió al hogar.

	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar),
	FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);


/******************************************************* 
	Solicitud Hogar
	Tabla que maneja las solicitudes que se hacen 
	para pertenecer a un hogar
********************************************************/
CREATE TABLE IF NOT EXISTS solicitud_hogar (
	id_solicitud SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	id_usuario INT NOT NULL,
	estado_solicitud SMALLINT NOT NULL, -- estado de la solicitud 1 = pendiente, 2 = autorizado, 3 = rechazado
	fecha_creacion TIMESTAMP NOT NULL,
	fecha_respuesta TIMESTAMP,
	token_solicitud TEXT,

	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Notificaciones
	Tabla que maneja las notificaciones del sistema
********************************************************/
CREATE TABLE IF NOT EXISTS notificaciones (
	id_notificacion SERIAL PRIMARY KEY NOT NULL,
	id_usuario INT NOT NULL, -- id del usuario que recibe la notificación
	mensaje CHAR(100) NOT NULL,
	tipo SMALLINT NOT NULL, -- 1 system, 2 entity | El tipo de notificación (solicitud, cambios en finanzas, etc.).
	id_entidad_relacionada INT, -- id de la entidad relacionada si (si la hay)
	entidad_relacionada TEXT, -- nombre de la entidad relacionada
	estado SMALLINT, -- estado de la notificacion 1 = leida, 0 = noleida
	fecha_creacion TIMESTAMP,
	fecha_lectura TIMESTAMP,
	enlace TEXT, -- URL o enlace directo para que el usuario pueda acceder al evento asociado.

	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

/******************************************************* 
	Historial cambios
	Tabla que almacena un log de las operaciones 
	realizadas dentro de un hogar
********************************************************/
CREATE TABLE IF NOT EXISTS historial_cambios_hogar ( 
	id_historial SERIAL PRIMARY KEY NOT NULL,
	id_usuario INT NOT NULL,
	id_hogar INT NOT NULL,
	entidad TEXT NOT NULL,
	descripcion TEXT NOT NULL,
	fecha_cambio TIMESTAMP NOT NULL,

	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Categorías
	La tabla de categorías almacenará las diferentes categorías posibles 
	que se pueden utilizar tanto para presupuestos como para gastos.
********************************************************/
CREATE TABLE IF NOT EXISTS categorias (
	id_categoria SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	nombre TEXT NOT NULL, -- nombre de la categoria: "alimentos" , "transporte" etc
	descripcion TEXT,
	tipo SMALLINT NOT NULL, -- gasto = 1, ingreso = 2
	
  FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Presupuesto
	El presupuesto contendrá un límite global y estará 
	asociado a múltiples categorías a través de una 
	tabla intermedia.
********************************************************/
CREATE TABLE IF NOT EXISTS presupuestos (
	id_presupuesto SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	nombre CHAR(250) NOT NULL,
	descripcion TEXT NOT NULL,
	monto_maximo DECIMAL(10, 2), -- monto máximo global del presupuesto
	periodo SMALLINT, -- intervalo de tiempo del presupuesto: 1 = semanal, 2 = mensual, 3 = anual
	fecha_inicio DATE NOT NULL,
	fecha_fin DATE, -- opcional en un presupuesto a plazo fijo

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Presupuesto  Categoria
	Esta tabla intermedia conectará cada presupuesto 
	con las categorías que cubre y el monto asignado 
	para cada categoría.
********************************************************/
CREATE TABLE IF NOT EXISTS presupuesto_categoria (
	id SERIAL PRIMARY KEY NOT NULL,
	id_presupuesto INT NOT NULL,
	id_categoria INT NOT NULL,
	monto_maximo DECIMAL(10, 2),

	FOREIGN KEY (id_presupuesto) REFERENCES presupuestos(id_presupuesto),
	FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

/******************************************************* 
	Cuentas
	Esta tabla intermedia conectará cada presupuesto 
	con las categorías que cubre y el monto asignado 
	para cada categoría.
********************************************************/
CREATE TABLE IF NOT EXISTS cuentas (
	id_cuenta SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	nombre CHAR(100) NOT NULL,
	tipo SMALLINT NOT NULL, -- tipo de cuenta : 1 = bancaria, 2 = efectivo, 3 = tarjeta_credito, 4 = inversion, 5 = prestamo
	saldo_inicial DECIMAL(10, 2), -- saldo con el que se abrió la cuenta
	saldo_actual DECIMAL(10, 2), -- saldo actualizado de la cuenta
	moneda CHAR(3), -- codigo de la moneda ej: USD, RD, EUR
	fecha_creacion TIMESTAMP,
	estado SMALLINT, -- 1 activo, 2 inactivo, 3 cerrada

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Transacciones
	tabla que simplifica el manejo de los ingresos y gastos
********************************************************/
CREATE TABLE IF NOT EXISTS transacciones (
	id_transaccion SERIAL PRIMARY KEY NOT NULL,
	id_cuenta INT NOT NULL, -- cuenta a la que pertenece la transacción
	id_hogar INT NOT NULL, -- hogar al que pertenece esta transacción
	id_categoria INT, -- Clasificación de la transacción (e.g., "Alimentos", "Salario").
	fecha TIMESTAMP NOT NULL, -- fecha en la que ocurrió la transacción
	monto DECIMAL(10, 2) NOT NULL, -- monto de la transacción
	descripcion TEXT, 
	tipo SMALLINT, -- tipo de transaccion; 1 = ingreso, 2 = gasto

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar),
	FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta),
	FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

/******************************************************* 
	Metas
	Las metas permiten a los usuarios definir un objetivo 
	financiero específico (por ejemplo, comprar un coche, 
	hacer un viaje, o crear un fondo de emergencia) y 
	registrar ahorros que contribuyan a esa meta.
********************************************************/
CREATE TABLE IF NOT EXISTS metas (
	id_meta SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	nombre CHAR(250) NOT NULL,
	descripcion TEXT NOT NULL,
	monto_objetivo DECIMAL(10, 2) NOT NULL,
	monto_ahorrado DECIMAL(10, 2) NOT NULL,
	fecha_limite TIMESTAMP,
	image_public_id TEXT,

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar)
);

/******************************************************* 
	Ahorros
	Los ahorros representarían el dinero que los usuarios deciden apartar de sus 
	ingresos para un propósito particular. 
	Estos ahorros pueden estar vinculados a una o más metas 
	específicas o simplemente estar guardados como reserva general.
********************************************************/
CREATE TABLE IF NOT EXISTS ahorros (
	id_ahorro SERIAL PRIMARY KEY NOT NULL,
	id_hogar INT NOT NULL,
	id_meta INT NOT NULL,
	id_cuenta INT,
	monto DECIMAL(10, 2) NOT NULL,
	descripcion char(100) NOT NULL,
	fecha TIMESTAMP NOT NULL,

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar),
	FOREIGN KEY (id_meta) REFERENCES metas(id_meta),
	FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
);

/******************************************************* 
	Deuda
	Las deudas pueden manejarse de forma similar a los 
	ahorros o gastos, pero necesitan detalles adicionales, 
	como el acreedor, el saldo pendiente, las cuotas, y los intereses. 
	Además, las deudas pueden estar asociadas a cuentas 
	bancarias o tarjetas de crédito dentro del hogar.
********************************************************/
CREATE TABLE IF NOT EXISTS deudas (
	id_deuda SERIAL PRIMARY KEY NOT NULL,
	id_cuenta INT NOT NULL,
	id_hogar INT NOT NULL,
	acreedor CHAR(150), -- nombre del acreedor banco o persona
	monto_inicial DECIMAL(10, 2) NOT NULL,
	monto_pendiente DECIMAL(10, 2) NOT NULL,
	interes DECIMAL(5, 2) NOT NULL,
	fecha_inicio TIMESTAMP NOT NULL,
	fecha_vencimiento TIMESTAMP,
	cuotas_totales SMALLINT,
	cuotas_restantes SMALLINT,
	descripcion TEXT NOT NULL,

	FOREIGN KEY (id_hogar) REFERENCES hogares(id_hogar),
	FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
);

/******************************************************* 
	Pagos Deuda
	Cada vez que el usuario realiza un pago para disminuir 
	una deuda, ese pago debe registrarse y reflejarse 
	en el saldo pendiente.
********************************************************/
CREATE TABLE IF NOT EXISTS pagos_deuda (
	id_pagos_deuda SERIAL PRIMARY KEY NOT NULL,
	id_deuda INT NOT NULL,
	id_cuenta INT,
	monto DECIMAL(10, 2) NOT NULL,
	fecha_pago TIMESTAMP NOT NULL,

	FOREIGN KEY (id_deuda) REFERENCES deudas(id_deuda),
	FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
);


COMMIT TRANSACTION

-- ROLLBACK TRANSACTION