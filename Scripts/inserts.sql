

use FinanzasHogar;


select * from usuarios;

INSERT INTO usuarios (
    nombre,
    apellidos,
    fecha_nacimiento,
    sexo,
    email,
    password,
    fecha_creacion,
    estado,
    avatar_url,
    ultimo_login,
    ip_ultimo_login,
    token_confirmacion,
    reset_password_token,
    intentos_fallidos,
    bloqueado_hasta,
    preferencias,
    pais
) 
VALUES (
    'John',
    'Doe',
    '1990-05-15',
    1, -- Masculino
    'john.doe@example.com',
    '123456789012', -- Password de 12 caracteres
    GETDATE(), -- Fecha de creación
    1, -- Activo
    'https://example.com/avatars/john.png',
    NULL, -- Último login aún no registrado
    NULL, -- IP del último login no registrada
    NEWID(), -- Token de confirmación generado automáticamente
    NULL, -- Sin token de recuperación
    0, -- Sin intentos fallidos
    NULL, -- No bloqueado
    '{"theme": "dark", "notifications": true}', -- Preferencias en formato JSON
    'USA' -- País
);



/** 
	Este es el query que me está imprimiendo kysily 
	RequestError: Incorrect syntax near '@1'
*/
select * from "usuarios" limit @1 offset @2 rows


SELECT * FROM usuarios
ORDER BY id_usuario
LIMIT 10
OFFSET 0 ROWS;


DECLARE @1 INT;
SET @1 = 10;

DECLARE @2 INT;
SET @2 = 0;

SELECT * 
FROM "usuarios"
ORDER BY "id_usuario"  -- Es necesario incluir un ORDER BY para usar OFFSET/FETCH
OFFSET @2 ROWS
FETCH NEXT @1 ROWS ONLY;