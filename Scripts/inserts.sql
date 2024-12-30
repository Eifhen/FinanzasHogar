

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
    GETDATE(), -- Fecha de creaci�n
    1, -- Activo
    'https://example.com/avatars/john.png',
    NULL, -- �ltimo login a�n no registrado
    NULL, -- IP del �ltimo login no registrada
    NEWID(), -- Token de confirmaci�n generado autom�ticamente
    NULL, -- Sin token de recuperaci�n
    0, -- Sin intentos fallidos
    NULL, -- No bloqueado
    '{"theme": "dark", "notifications": true}', -- Preferencias en formato JSON
    'USA' -- Pa�s
);



/** 
	Este es el query que me est� imprimiendo kysily 
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