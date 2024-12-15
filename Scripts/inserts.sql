

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