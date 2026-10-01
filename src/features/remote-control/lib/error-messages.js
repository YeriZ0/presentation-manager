const messages = {
    INVALID_CODE: 'El código no es válido, ha caducado o ya se utilizó.',
    INVALID_MESSAGE: 'Los datos recibidos no son compatibles con esta sesión.',
    PAYLOAD_TOO_LARGE:
        'Las notas o los metadatos superan el tamaño permitido para el control móvil.',
    CONTROLLER_BUSY:
        'Esta presentación ya tiene un controlador conectado o reservado.',
    SESSION_EXPIRED:
        'La sesión ha caducado. Genere un nuevo código para conectar.',
    SESSION_CLOSED: 'La presentación se ha cerrado.',
    UNAUTHORIZED:
        'El acceso al controlador ya no está autorizado. Empareje de nuevo.',
    PLAYER_NOT_READY: 'Espere a que la diapositiva esté preparada.',
    OUT_OF_RANGE: 'No hay otra diapositiva en esa dirección.',
    STALE_COMMAND:
        'La diapositiva cambió antes de recibir la orden. Revise el estado actual.',
    RESULT_UNKNOWN:
        'No se recibió la confirmación. Se sincronizará el estado antes de continuar.',
    CONNECTION_FAILED:
        'No se pudo conectar con el servidor. Compruebe la conexión.',
    DISCONNECTED:
        'La conexión se está recuperando. Espere antes de enviar acciones.',
    PRESENTER_OFFLINE:
        'El escritorio está desconectado. Esperando su recuperación.',
    TOO_MANY_ATTEMPTS:
        'Se han realizado demasiados intentos. Espere un minuto.',
    COMMAND_PENDING: 'Hay una acción pendiente. Espere su confirmación.',
    SERVER_BUSY: 'El servidor está ocupado. Inténtelo más tarde.',
};

export function remoteErrorMessage(code) {
    return Object.hasOwn(messages, code)
        ? messages[code]
        : 'No se pudo completar la acción. Inténtelo de nuevo.';
}
