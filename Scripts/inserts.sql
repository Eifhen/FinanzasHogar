

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