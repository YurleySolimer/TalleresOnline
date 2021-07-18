
drop database database_carhelp;


CREATE DATABASE database_carhelp;

USE database_carhelp;

CREATE TABLE users (
	id INT(11) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(200) NOT NULL,
	tipo ENUM ('Admin', 'Cliente', 'Trabajador') DEFAULT 'Cliente',
	fotoNombre VARCHAR (100) DEFAULT 'user.png',
	fotoUbicacion VARCHAR (300) DEFAULT 'src\public\uploads\user.png', 
	razon_social VARCHAR(20),
	fullname VARCHAR(100),
	apellido VARCHAR (100),
	telefono VARCHAR (50)
);

ALTER TABLE users
	ADD PRIMARY KEY (id);

ALTER TABLE users
	MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

DESCRIBE users;

INSERT INTO users (email, password, tipo) VALUES('talleres.online.peru@gmail.com', '$2a$10$GBoytowlq7f2hgQnpWQ7mer06rvyecRYZQCooz39vk7dq5JvlZ6dO', 'Admin');


CREATE TABLE accesos (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	accesos VARCHAR (50) NOT NULL
);

CREATE TABLE locales (
	id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombreLocal VARCHAR(150) NOT NULL,
	direccion VARCHAR(250) NOT NULL,
	distrito VARCHAR(50) NOT NULL,
	telefono VARCHAR(25) NOT NULL,
	user_id INT(11),
	horarioEntrada VARCHAR (20),
	horarioSalida VARCHAR (20),
	ruc_local VARCHAR(20) NOT NULL,
	fotoNombre VARCHAR (300),
	fotoUbicacion VARCHAR (300),
	email VARCHAR (120),
    medioPago_id VARCHAR (100),
	CONSTRAINT fk_user2 FOREIGN KEY  (user_id) REFERENCES users(id)

);

DESCRIBE locales;

CREATE TABLE trabajadores (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombre VARCHAR (25) NOT NULL,
	apellido VARCHAR (25) NOT NULL,
	cargo VARCHAR (40) NOT NULL,
	id_localT INT (11),
	id_userT INT (11),
	id_creador INT (11),
	CONSTRAINT fk_localT FOREIGN KEY (id_localT) REFERENCES locales(id),
	CONSTRAINT fk_userT FOREIGN KEY (id_userT) REFERENCES users(id)

);


CREATE TABLE carros (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	placa VARCHAR (50),
	modelo VARCHAR (50),
	marca VARCHAR (50),
	tipo ENUM ('Camioneta', 'Auto', 'Moto') DEFAULT 'Auto',
	año INT (20),
	nivel_gasolina INT (50),
	observacion TEXT,
	declaracion TEXT,
	kilometraja ENUM ('Kilometros', 'Millas') DEFAULT 'Kilometros',
	km INT (11) DEFAULT 0
);

CREATE TABLE fotosVehiculos (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	fotoNombre VARCHAR (100),
	fotoUbicacion VARCHAR (300),
	id_carro INT (11),
	CONSTRAINT fk_vehiculos FOREIGN KEY  (id_carro) REFERENCES carros(id)
);


CREATE TABLE clientes (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombre VARCHAR (50) NOT NULL,
	correo VARCHAR (50) NOT NULL,
	tlf VARCHAR (30) NOT NULL,
	distrito VARCHAR (50) NOT NULL,
	fecha_nacimiento DATE,
	genero VARCHAR (20),
	conocio_carhelp VARCHAR (100),
	rucCliente VARCHAR (50),
	codigoProm VARCHAR (50),
	departamento VARCHAR (50),
	provincia VARCHAR (50)
);

CREATE TABLE clienteTaller (
	cliente_id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	taller_id INT (11),
	numero_visitas INT (11) default 0,
	ultima_visita TIMESTAMP,
    tipo_cliente ENUM ('Nuevo', 'Recurrente') default 'Nuevo', 
	CONSTRAINT fk_cliente3 FOREIGN KEY  (cliente_id) REFERENCES clientes(id),
	CONSTRAINT fk_taller3 FOREIGN KEY  (taller_id) REFERENCES locales(id)
);


CREATE TABLE ot (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	subtotal FLOAT (15),
	numero INT (50),
	categoria VARCHAR (50),
	iva FLOAT (15),
	total FLOAT (15),
	fecha_recepcion timestamp NOT NULL DEFAULT current_timestamp,
	id_local INT (11),
	facturada ENUM ('True', 'False') DEFAULT "False",
	user_empresa INT(11),
	CONSTRAINT fk_idlocal FOREIGN KEY (id_local) REFERENCES locales(id),
	CONSTRAINT fk_empresa FOREIGN KEY (user_empresa) REFERENCES users(id) 

);

DESCRIBE ot;

CREATE TABLE otImportes (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_ot INT (11),
	importe INT (30),
	descripcion TEXT,
	CONSTRAINT fk_idot FOREIGN KEY (id_ot) REFERENCES ot(id)
);


CREATE TABLE trabajadorOT (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_ot INT (11),
	id_trabajadores INT (11),
	id_local INT (11),
	CONSTRAINT fk_trabajadores2 FOREIGN KEY  (id_trabajadores) REFERENCES trabajadores(id),
	CONSTRAINT fk_localeT FOREIGN KEY (id_local) REFERENCES locales (id),
	CONSTRAINT fk_ot2 FOREIGN KEY  (id_ot) REFERENCES ot(id)

);

CREATE TABLE clienteOT (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_ot INT (11),
	id_clientes INT (11),
	CONSTRAINT fk_clientes FOREIGN KEY  (id_clientes) REFERENCES clientes(id),
	CONSTRAINT fk_ot3 FOREIGN KEY  (id_ot) REFERENCES ot(id)

);

CREATE TABLE carrosOT (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_ot INT (11),
	id_carro INT (11),
	CONSTRAINT fk_carro FOREIGN KEY  (id_carro) REFERENCES carros(id),
	CONSTRAINT fk_ot4 FOREIGN KEY  (id_ot) REFERENCES ot(id)

);

CREATE TABLE facturas (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	tipo ENUM ('Factura', 'Boleta'),
	estado ENUM ('Emitida', 'Anulada') DEFAULT 'Emitida',
	ruc_cliente VARCHAR(40),
	id_ot INT (11),
	fecha_emicion timestamp NOT NULL,
	numero_factura INT (50)
);


CREATE TABLE trabajadorAcceso (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	trabajador_id INT (11),
	acceso_id INT(11)
);

ALTER TABLE ot
	ADD estado ENUM ('Recepcionados', 'Trabajando', 'Listos', 'Entregados') DEFAULT 'Recepcionados';


CREATE TABLE userSuscripcion (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_user INT (11),
	tipo_suscripcion ENUM ('Prueba', 'Estandar', 'Premium', 'N/A') DEFAULT 'N/A',
	fecha_pago TIMESTAMP DEFAULT current_timestamp,
    fecha_pago_siguiente TIMESTAMP DEFAULT current_timestamp,
	monto_pago INT DEFAULT 0,
	id_local_pagado INT (11),
	CONSTRAINT fk_usuario FOREIGN KEY  (id_user) REFERENCES users(id),
	CONSTRAINT fk_localeU FOREIGN KEY (id_local_pagado) REFERENCES locales (id)
);

ALTER TABLE userSuscripcion 	
	ADD dias_restantes INT (11) DEFAULT 30;	

ALTER TABLE userSuscripcion 	
	ADD suscrito ENUM ('Si', 'No') DEFAULT 'No';	

ALTER TABLE locales	
	ADD activo ENUM ('true', 'false') DEFAULT 'false';	


CREATE TABLE planSuscripcion (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	accesos  INT (200) DEFAULT 5,
	estadisticas VARCHAR (11) DEFAULT 'true',
	ots VARCHAR (20) DEFAULT 'true',
	proformas VARCHAR (20) DEFAULT 'false',
	facturas VARCHAR (20) DEFAULT 'false',
	idSuscrip INT (11),
	local_id INT (11),
	CONSTRAINT fk_suscripcion FOREIGN KEY (idSuscrip) REFERENCES userSuscripcion (id),
	CONSTRAINT fk_localPlan FOREIGN KEY (local_id) REFERENCES locales (id)
);


CREATE TABLE proformas (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	tipoCarro ENUM ('Auto', 'Camioneta', 'Moto') DEFAULT "Auto",
	placa VARCHAR(20),
	marca VARCHAR (20),
	modelo VARCHAR (25),
	año INT (20),
	kilometraje VARCHAR (20),
	km ENUM ('Kilometros', 'Millas') DEFAULT "Kilometros",
	nombre VARCHAR (20),
	telefono VARCHAR (30),
	RUC VARCHAR (30),
	correo VARCHAR (100),
	distrito VARCHAR (30),
	categoria VARCHAR (100),
	subtotal FLOAT (15),
	iva FLOAT (15),
	total FLOAT (15),
	fecha_emicion timestamp NOT NULL DEFAULT current_timestamp,
	id_local INT (11),
	id_user INT (11),
	CONSTRAINT fk_idlocal2 FOREIGN KEY (id_local) REFERENCES locales(id),
	CONSTRAINT fk_iduserproforma FOREIGN KEY (id_user) REFERENCES users(id) 

);

DESCRIBE proformas;

CREATE TABLE proformaImportes (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_proforma INT (11),
	importe INT (30),
	descripcion TEXT,
	CONSTRAINT fk_idproforma FOREIGN KEY (id_proforma) REFERENCES proformas(id)
);


CREATE TABLE exportaciones (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	numero INT (11),
	ubicacion TEXT (200),
	id_local INT (11),
    id_user INT (11),
	fecha timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_usuario2 FOREIGN KEY (id_user) REFERENCES users (id),
	CONSTRAINT fk_local FOREIGN KEY (id_local) REFERENCES locales(id)

);




INSERT INTO accesos (accesos) VALUES('Ordenes de Trabajo'), ('Proformas'), ('Estadísticas'), ('Tienda Online'),  ('Facturacion'),  ('Mis Clientes'),  ('Estado de Cuentas'), ('Mis Promociones');








CREATE VIEW otCompleta AS
SELECT ot.subtotal, ot.iva, ot.categoria, ot.total, ot.fecha_recepcion, ot.numero, ot.estado, ot.id_local, ot.facturada, ot.id as otid,
	   c.nombre, c.correo, c.distrito, c.tlf, c.fecha_nacimiento, c.rucCliente, c.genero, c.conocio_carhelp, 
	   ct.tipo_cliente,
	   v.placa, v.año, v.kilometraja, v.modelo, v.observacion, v.declaracion, v.marca, v.tipo, v.id as vid,
	   l.nombreLocal, l.direccion, l.user_id

FROM ot
JOIN locales l on l.id = ot.id_local
JOIN clienteOT co on co.id_ot = ot.id
JOIN carrosOT vo on vo.id_ot = ot.id
JOIN clientes c on co.id_clientes = c.id
JOIN clienteTaller ct on c.id = cliente_id
JOIN carros v on vo.id_carro = v.id;



CREATE VIEW facturaCompleta AS
SELECT f.tipo, f.estado, f.ruc_cliente, f.fecha_emicion, f.numero_factura, f.id, f.id_ot,
	   o.numero, o.subtotal, o.iva, o.total, o.id_local, o.id as idOT,
	   c.nombre, c.correo, c.distrito, c.tlf, c.fecha_nacimiento, c.genero, c.conocio_carhelp, 
	   v.placa, v.año, v.kilometraja, v.modelo, v.observacion, v.declaracion,
	   l.nombreLocal, l.direccion, l.user_id
FROM facturas f
JOIN ot o on f.id_ot = o.id
JOIN locales l on l.id = o.id_local
JOIN clienteOT co on co.id_ot = o.id
JOIN carrosOT vo on vo.id_ot = o.id
JOIN clientes c on co.id_clientes = c.id
JOIN carros v on vo.id_carro = v.id;

CREATE VIEW trabajadorAccesoCompleta AS
SELECT t.nombre, t.apellido, t.cargo, t.id, t.id_userT, t.id_creador, 
	   ta.trabajador_id, 
	   a.accesos,
	   l.id as id_local, l.nombreLocal

FROM trabajadores t
JOIN locales l on l.id = t.id_localT
JOIN trabajadorAcceso ta on ta.trabajador_id = t.id
JOIN accesos a on ta.acceso_id = a.id;


CREATE VIEW usuarioLocal AS
	SELECT u.fullname, u.email, u.tipo, u.id,
	       l.direccion, l.telefono, l.nombreLocal
	FROM users u 
	JOIN locales l on l.user_id = u.id;


CREATE VIEW trabajadorUser AS
	SELECT t.id, t.nombre, t.apellido, t.cargo, t.id_localT, t.id_creador, t.id_userT, u.fotoNombre, u.fotoUbicacion
	FROM trabajadores t
	JOIN locales l on l.id = t.id_localT
	JOIN users u on l.user_id = u.id;


CREATE VIEW resumenUser AS
	SELECT o.id, o.subtotal, o.iva, o.total, o.fecha_recepcion, o.id_local,
		   o.numero, o.categoria, o.estado,
		   u.id as userId
	FROM ot o
	JOIN locales l on l.id = o.id_local
	JOIN users u on u.id = l.user_id
;



CREATE VIEW tallerClienteCompleta AS
SELECT c.id, c.nombre, c.correo, c.tlf, c.distrito, c.fecha_nacimiento, c.genero, c.conocio_carhelp, c.rucCliente, c.codigoProm,
       ct.taller_id, ct.numero_visitas, ct.ultima_visita, ct.tipo_cliente,
	   l.user_id
from clientes c 
JOIN clienteTaller ct on ct.cliente_id = c.id
JOIN locales l on l.id = ct.taller_id
;


CREATE VIEW nuevoTotal AS
SELECT ot.subtotal, ot.iva, ot.total, ot.fecha_recepcion, ot.numero, ot.estado, ot.id_local, ot.categoria,
	   c.nombre, c.correo, c.distrito, c.tlf, c.fecha_nacimiento, c.genero, c.conocio_carhelp,
       ct.tipo_cliente,
	   l.user_id


FROM ot
JOIN locales l on l.id = ot.id_local
JOIN clienteOT co on co.id_ot = ot.id
JOIN clientes c on co.id_clientes = c.id
JOIN clienteTaller ct on ct.cliente_id = c.id; 


CREATE VIEW localPlan AS 
SELECT l.nombreLocal, l.direccion, l.distrito, l.telefono, l.user_id,  l.horarioEntrada, l.horarioSalida, 
	   l.ruc_local, l.fotoNombre, l.fotoUbicacion, l.email, l.medioPago_id, l.activo, l.id,
	   s.tipo_suscripcion, s.fecha_pago, s.fecha_pago_siguiente, s.suscrito, s.dias_restantes,
	   p.accesos, p.estadisticas, p.ots, p.proformas, p.facturas
FROM locales l 
JOIN userSuscripcion s ON s.id_local_pagado = l.id
JOIN planSuscripcion p ON idSuscrip = s.id;

CREATE VIEW localSuscripcion AS 
SELECT l.nombreLocal, l.direccion, l.distrito, l.telefono, l.user_id, l.horarioEntrada, l.horarioSalida, 
	   l.ruc_local, l.fotoNombre, l.fotoUbicacion, l.email, l.medioPago_id, l.activo, l.id,
	   s.tipo_suscripcion, s.fecha_pago, s.fecha_pago_siguiente, s.suscrito, s.dias_restantes
FROM locales l 
JOIN userSuscripcion s ON s.id_local_pagado = l.id;



CREATE VIEW exportacionHistorial AS
SELECT e.numero, e.ubicacion, e.fecha as fechaE, e.id_user, l.nombreLocal
FROM exportaciones e 
JOIN locales l on l.id = e.id_local;

CREATE VIEW proformaCompleta AS
SELECT p.subtotal, p.iva, p.total, p.fecha_emicion, p.id_local, p.id as proformaid,
	   p.nombre, p.correo, p.distrito, p.telefono, p.placa, p.año, p.kilometraje, p.modelo, p.marca,
	   p.categoria, p.RUC,
	   l.nombreLocal, l.direccion, l.user_id

FROM proformas p
JOIN locales l on l.id = p.id_local;

CREATE VIEW trabajadorLocal AS
SELECT t.nombre, t.apellido, t.id_creador, l.nombreLocal, t.id
FROM trabajadores t 
JOIN locales l on l.id = t.id_localT; 


CREATE TABLE ResetTokens (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  email varchar(255) DEFAULT NULL,
  token varchar(255) DEFAULT NULL,
  expiration datetime DEFAULT NULL,
  createdAt datetime,
  updatedAt datetime,
  used int(11) NOT NULL DEFAULT '0'
);

CREATE TABLE cuentasCarHelp (
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	tipo ENUM ('Corriente', 'Ahorro'),
	banco Text,
	moneda ENUM ('Soles', 'Dolares') DEFAULT 'Soles',
	numero_cuenta VARCHAR (200),
	numero_interbancario VARCHAR (200)
);

CREATE TABLE reclamos ( 
	id INT (11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	tipo ENUM ('Reclamo', 'Consulta') DEFAULT 'Consulta',
	reclamo text,
	id_user INT (11),
	razon VARCHAR (50),
	fecha_realizado TIMESTAMP DEFAULT current_timestamp,
	estatus ENUM ('Enviado', 'En Proceso', 'Terminado') DEFAULT 'Enviado',
	CONSTRAINT fk_usuario3 FOREIGN KEY (id_user) REFERENCES users (id)
);
	



CREATE VIEW vistaEstado AS 
	SELECT o.numero, o.estado, o.fecha_recepcion, o.categoria, o.id, o.id_local,
		   v.placa, v.modelo,v.año, v.kilometraja,  v.observacion, v.declaracion, v.marca, v.tipo,
		   c.nombre,
		   l.user_id
	FROM ot o 
	JOIN locales l on l.id = o.id_local
	JOIN clienteOT co on co.id_ot = o.id
    JOIN carrosOT vo on vo.id_ot = o.id
	JOIN clientes c on co.id_clientes = c.id 
	JOIN carros v on vo.id_carro = v.id;

;