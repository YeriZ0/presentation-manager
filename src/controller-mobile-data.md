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
