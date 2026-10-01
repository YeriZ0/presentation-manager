# Datos Para El Controlador Móvil

## Objetivo

El controlador móvil debe manejar una presentación que ya está abierta en el equipo presentador. No necesita recibir el paquete ZIP, el HTML, los recursos, los estilos ni el JavaScript de las diapositivas.

## Datos De La Presentación

Al iniciar una sesión, el controlador necesita conocer:

- Título de la presentación
- Cantidad total de diapositivas
- Diapositiva activa, usando índice y número visible
- Lista ordenada de diapositivas
- Identificador estable de cada diapositiva
- Título de cada diapositiva
- Apuntes de cada diapositiva, cuando existan

## Estado Del Reproductor

El controlador necesita recibir los cambios de:

- Diapositiva activa
- Estado de preparación de la diapositiva activa
- Pantalla completa activa o inactiva
- Timer visible u oculto
- Timer en ejecución o pausado
- Tiempo transcurrido del timer
- Posición elegida para el timer
- Error visible del reproductor, cuando exista

## Acciones Del Controlador

El controlador debe poder solicitar:

- Ir a la siguiente diapositiva
- Ir a la diapositiva anterior
- Ir a una diapositiva disponible por su índice
- Mostrar u ocultar el timer
- Pausar o continuar el timer
- Reiniciar el timer
- Cambiar la posición del timer
- Solicitar pantalla completa o su salida
- Cerrar la presentación

## Reglas De Seguridad Y Consistencia

- No compartir el archivo ZIP original
- No compartir archivos HTML, CSS o JavaScript de las diapositivas
- No compartir recursos binarios, URLs temporales ni rutas internas del paquete
- No permitir ir fuera del rango de diapositivas disponible
- No permitir avanzar o retroceder mientras la diapositiva activa no esté preparada
- Mantener el estado del controlador sincronizado con el reproductor como fuente de verdad
- Tratar la pantalla completa como una solicitud: el navegador del equipo presentador puede requerir una interacción local para aceptarla
- Al cerrar una presentación, eliminar los datos de esa sesión del controlador

## Contrato Ejecutable

La versión y los eventos se definen en `shared/remote-control/protocol.js`; los payloads permitidos se validan en `shared/remote-control/validators.js`. El servidor y ambos clientes reutilizan esas definiciones.

- `/presenter` prepara la presentación; `/presenter/live` la reproduce; `/controller` empareja y controla
- El protocolo utiliza `protocolVersion: 1`, `sessionId` y `requestId` para las órdenes
- La navegación envía `next` o `previous` y `expectedSlideId`
- Los ajustes envían valores explícitos mediante `timer-enabled`, `timer-running` y `timer-position`; `timer-reset` reinicia
- El estado incluye fase, índice, identificador activo, preparación, pantalla completa y propiedades del temporizador
- Los metadatos incluyen título y lista ordenada de identificadores, títulos y notas como texto
- Cada publicación lleva una revisión creciente y la generación autorizada del controlador
- El servidor devuelve resultados `ok` o errores estables; el éxito se confirma tras la ejecución en el escritorio
- Los cortes involuntarios reservan el puesto durante 60 segundos y requieren resincronización antes de habilitar acciones
- La desconexión voluntaria revoca la credencial y no permite recuperación automática
- Los códigos tienen seis dígitos, cinco minutos de validez y un único uso
- Los recursos del paquete y las credenciales no aparecen en las URLs

El inicio, el salto directo, el cierre remoto y la solicitud de pantalla completa quedan fuera de las órdenes móviles de esta primera versión. El cierre local termina toda la sesión.
