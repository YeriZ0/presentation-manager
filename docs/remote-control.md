# Control móvil de presentaciones

El escritorio conserva y ejecuta el ZIP. El controlador recibe títulos, notas de texto y estado del reproductor mediante un servidor Socket.IO. Puede conectarse antes de iniciar o durante la reproducción.

## Ejecución manual en desarrollo

Requisitos: Node.js compatible con Vite 7 y npm. El proyecto utiliza `package-lock.json` y declara npm como gestor.

```powershell
npm install
npm run dev
```

El servidor de desarrollo integra Vite y Socket.IO en `http://127.0.0.1:5173`, con recarga automática. Las tareas previas de catálogo y exportación PPTX se conservan.

### Prueba con dos navegadores

1. Abra `http://127.0.0.1:5173/` en una ventana de al menos 768 px de ancho
2. Importe su ZIP en `/presenter`
3. Pulse «Conectar control móvil», junto a «Exportar PPTX»
4. Abra la misma dirección en otro navegador con menos de 768 px de ancho; la raíz redirige a `/controller`
5. Introduzca el código de seis dígitos
6. El móvil muestra los datos y espera el inicio
7. Pulse «Empezar a presentar» en el escritorio; la ruta cambia a `/presenter/live`
8. Compruebe navegación, notas y ajustes del temporizador desde el controlador
9. Cambie de diapositiva en el escritorio y compruebe la actualización del controlador
10. Pruebe la X: «Cancelar» conserva la conexión; «Desconectar» revoca el acceso sin cerrar la presentación

Las rutas explícitas conservan su función independientemente del tamaño. Cambiar dimensiones no desconecta ni convierte un presentador en controlador. El navegador puede necesitar una recarga o una nueva visita a `/` para probar otra elección inicial.

La pantalla inicial del presentador muestra «Volver al controlador móvil» debajo de los requisitos del ZIP únicamente con un ancho inferior a 768 px. Su visibilidad se actualiza al cambiar las dimensiones. Es el acceso inverso a «Abrir el presentador» del formulario de emparejamiento. Si hay una presentación cargada, ciérrela para volver a esa pantalla antes de cambiar de función.

### Prueba con un teléfono en red local

```powershell
npm run dev -- --host 0.0.0.0
```

Abra el presentador y el controlador usando la dirección accesible del equipo, por ejemplo `http://192.168.1.20:5173/presenter` y `http://192.168.1.20:5173/controller`. Sustituya esa IP por la del equipo en su red.

La dirección del diálogo se construye a partir del origen abierto en el escritorio. Para que sea válida en el teléfono, abra también el escritorio mediante la IP local. `localhost` y `127.0.0.1` sirven para la prueba de dos navegadores del mismo equipo.

La red y el firewall deben permitir la comunicación entre dispositivos. No se requiere compartir ni subir el ZIP al teléfono.

## Rutas y sesión del reproductor

- `/`: redirección inicial según dimensiones
- `/presenter`: importador o pantalla previa
- `/presenter/live`: reproducción del ZIP importado en esa pestaña
- `/controller`: emparejamiento, control y recuperación

La presentación, el store, el temporizador y la conexión pertenecen a un contenedor compartido del presentador. Volver a la pantalla previa conserva la sesión, pausa el reloj y obliga a preparar de nuevo el iframe al regresar a reproducción.

Recargar `/presenter/live` pierde el paquete mantenido en memoria y devuelve al importador. La recarga del controlador en la misma pestaña intenta recuperar su credencial de `sessionStorage`.

## Emparejamiento y recuperación

- Un controlador activo por presentación
- Código de seis dígitos, cinco minutos de validez y uso único
- Consumir código y reservar controlador forman una operación atómica
- Códigos regenerados invalidan el anterior
- Un puesto conectado o reservado no se reemplaza con otro código
- Ante un corte involuntario, el servidor reserva el puesto durante 60 segundos desde su detección
- Socket.IO recupera el transporte; el servicio valida la credencial y solicita una instantánea antes de habilitar acciones
- Si vence el plazo, se necesita un nuevo emparejamiento
- La X revoca la autorización y detiene la reconexión automática
- Si la X se confirma sin red, se borran los datos locales y el servidor libera el puesto al vencer la reserva
- Cerrar la presentación termina toda la sesión
- Reiniciar el servidor invalida las sesiones temporales en memoria

El escritorio sigue presentando durante un corte del controlador. Si el escritorio pierde su conexión, el controlador bloquea órdenes hasta recuperar el enlace. El reloj depende del escritorio.

## Acciones y consistencia

El controlador puede avanzar, retroceder, mostrar u ocultar el temporizador, pausar o continuar, reiniciar y elegir una esquina. Inicio, salto directo, cierre remoto y pantalla completa remota quedan fuera de esta versión.

La navegación valida fase, preparación, rango e identificador esperado de diapositiva. Una orden atrasada no puede avanzar una diapositiva distinta de la mostrada cuando se solicitó.

Las órdenes llevan un identificador y se deduplican en el escritorio. Solo hay una acción remota pendiente por sesión. Un resultado positivo se devuelve después de ejecutar; la siguiente navegación espera la preparación de la diapositiva.

Un timeout tiene resultado indeterminado: se sincroniza el estado y no se reenvía automáticamente la orden. El gateway añade un plazo de ejecución y el escritorio lo verifica con una referencia al reloj del servidor obtenida en el emparejamiento. Las revisiones de estado descartan mensajes antiguos.

La recuperación de identidad puede repetirse una vez si se pierde su confirmación; esa excepción solo aplica al emparejamiento de una credencial ya existente, no a órdenes del reproductor. Recargar el controlador suspende el transporte sin revocar la credencial, y volver desde la caché del navegador intenta recuperar la misma sesión.

Las notas se representan como texto. Los mensajes no contienen archivos del paquete, binarios, URLs temporales, rutas internas ni setters arbitrarios.

## Límites iniciales

- Payloads JSON de hasta 2 MiB; el transporte reserva 1 KiB adicional para el encapsulado de Socket.IO
- Hasta 2000 diapositivas en metadatos, sujetas también al límite total del mensaje
- Títulos de hasta 1024 caracteres y notas de hasta 65536 caracteres por diapositiva
- Doce intentos por minuto, dirección y operación de creación, emparejamiento o regeneración
- Treinta solicitudes por segundo por conexión
- Hasta 1000 sesiones simultáneas en la instancia inicial
- Hasta 256 resultados deduplicados por reproductor, con retención de dos minutos

Si las notas o los metadatos exceden el límite, el controlador recibe un error y no se carga el paquete como alternativa. Los valores están centralizados en `shared/remote-control/protocol.js` y `server/remote-control/domain/session-policy.js`.

## Arquitectura y mantenimiento

### Módulos

- `shared/remote-control/`: protocolo, validadores Ajv, errores y contratos JSDoc sin dependencias del navegador
- `server/remote-control/domain/`: políticas de caducidad y estado
- `server/remote-control/services/`: sesiones y retransmisión de órdenes
- `server/remote-control/adapters/`: repositorio en memoria, tokens criptográficos, dirección de cliente y gateway Socket.IO
- `src/features/presentation-player/services/`: acciones compartidas y temporizador
- `src/features/remote-control/`: servicios de cliente, transporte, credenciales, publicación y emparejamiento
- `src/features/mobile-controller/`: componentes y distribución móvil
- `src/app/`: rutas y contenedores por función, cargados de forma diferida

### Funciones principales

- `createRemoteServer`, propia del proyecto, compone `node:http`, Socket.IO y servicios; comparte reglas entre desarrollo y producción
- `createSessionService`, propia del proyecto, recibe repositorio, reloj y fábrica de tokens; no depende del transporte
- `createPlayerActions`, propia del proyecto, centraliza ejecución y deduplicación sobre el store Zustand
- `createPresentationTimer`, propia del proyecto, recibe reloj y scheduler y conserva las reglas de pausa y pantalla completa
- `createBrowserScheduler`, propia del proyecto, adapta `setTimeout`, `clearTimeout`, `setInterval` y `clearInterval` de la API nativa `Window`, conservando su receptor al inyectarlas en los servicios
- `createPresenterConnectionService` y `createControllerConnectionService`, propias del proyecto, coordinan puertos sin crear sockets en componentes
- `assertMessage`, propia del proyecto y basada en Ajv, valida payloads permitidos y límites
- React Router organiza las rutas; React carga layouts diferidos y Zustand ofrece selectores de estado
- shadcn/ui aporta código fuente de componentes; Radix y Vaul gestionan overlays y foco, y Tailwind aplica tokens semánticos

Los componentes de `src/components/ui/` se añadieron con la CLI del registro oficial de shadcn/ui. El switch utiliza `Switch.Root` y `Switch.Thumb` de Radix; el panel del temporizador utiliza el `Drawer` basado en Vaul. El proyecto adapta tema, accesibilidad y layout sobre esos componentes. El reset de los botones UI elimina el relleno nativo del navegador para conservar la geometría esperada por shadcn.

Los servicios reciben dependencias al crearse. Los componentes y hooks no importan sockets ni políticas del servidor. Las credenciales permanecen en el servicio y, para el controlador, en almacenamiento por pestaña; no forman parte del estado visible ni de las URLs.

Para añadir una orden, actualice el contrato, su validador, el handler en `player-actions.js`, la traducción de errores y las pruebas pertinentes. No añada reglas de negocio a los componentes ni setters remotos genéricos.

## Verificación manual y automatizada

```powershell
npm test
npm run lint
npm run format:check
npm run build
```

Las pruebas nuevas utilizan Vitest y clientes Socket.IO de Node.js con puertos efímeros. Incluyen emparejamiento concurrente, límites de autorización, versiones del repositorio, caducidad, deduplicación, sincronización, recuperación y revocación. No se añadieron pruebas con Playwright.

Revise manualmente notas extensas, primera y última diapositiva, estados de preparación, cambio de dimensiones, foco de los diálogos, pantalla completa y desconexión cancelada. Compruebe anchos de 320, 375 y 430 px, orientación horizontal y suspensión de un teléfono real.

### Resultado de las comprobaciones de implementación

- Vitest: 155 pruebas aprobadas en 24 archivos
- ESLint: sin errores ni advertencias
- Compilación directa con Vite: correcta; conserva una advertencia por un chunk de más de 500 KiB
- Prettier sobre archivos añadidos y modificados: correcto
- Prettier global: detecta diferencias de formato en 159 archivos preexistentes ajenos a estos cambios
- La prueba visual en navegadores y teléfono y la validación del VPS quedan para el recorrido manual

## Producción y VPS

Compile y arranque manualmente:

```powershell
npm ci
npm run build
npm start
```

`npm start` sirve `dist/` y Socket.IO en `127.0.0.1:3000`, sin importar Vite en producción. `HOST` y `PORT` permiten modificar la dirección y el puerto. Para producción con proxy local, configure `TRUST_PROXY=1` en el entorno del proceso.

También puede compilar en el equipo de desarrollo y desplegar `dist/`, `server/`, `shared/`, `package.json` y `package-lock.json`. En ese caso, instale las dependencias con `npm ci --omit=dev` y arranque con `npm start`. Esto evita exigir al VPS el navegador que utiliza la compilación previa de los diagramas del catálogo.

El servidor sirve `index.html` en las rutas conocidas de React, incluidos acceso directo y recarga. Socket.IO y los recursos estáticos conservan sus rutas; un recurso ausente devuelve 404.

Un proxy Nginx puede utilizar esta configuración dentro de un servidor HTTPS ya configurado, sustituyendo el dominio y los certificados según el VPS:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-For $remote_addr;
}

location /socket.io/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 75s;
}
```

Con `TRUST_PROXY=1`, las direcciones reenviadas solo se aceptan desde un proxy conectado por loopback. Nginx debe sobrescribir esa cabecera como en el ejemplo, para que los límites no agrupen a todos los usuarios bajo la IP del proxy ni acepten una dirección inventada por el cliente.

Las conexiones del navegador deben proceder del mismo origen del sitio. Escritorio y móvil pueden estar en redes distintas si ambos acceden al mismo dominio HTTPS.

La primera versión utiliza una instancia con sesiones en memoria. Para distribuirla, se necesitan almacenamiento atómico compartido, distribución de eventos Socket.IO y coordinación de expiraciones; cambiar solo el repositorio no completa esa migración.
