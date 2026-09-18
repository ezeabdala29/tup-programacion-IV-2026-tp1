# Ejercicio 3 - API de Gestión de Tareas

Desarrollo de una API REST con ExpressJS para la administración y seguimiento del estado de tareas, utilizando persistencia en memoria y aplicando validaciones estrictas sobre los datos de entrada.

## Cumplimiento de las Directivas Generales del TP

* **Control de Versiones y Estructura:** El desarrollo se aisló en la carpeta `Ejercicio 3/`, trabajando sobre la rama correspondiente (`ezequiel-leguiza`) y registrando los avances mediante commits. Se incluyó un archivo `.gitignore` para excluir `node_modules`.
* **Pruebas de Integración:** Se adjunta el archivo `tareas.http` con escenarios de éxito y error probados mediante la extensión REST Client, cubriendo todos los métodos solicitados.

---

## Definición del Recurso y Métodos HTTP

En cumplimiento con la consigna de plantear los métodos y el nombre del recurso, se definió el sustantivo plural `/tareas` como base de la API. 

* `GET /tareas`: Obtiene la colección completa de tareas.
* `POST /tareas`: Crea un nuevo recurso.
* `GET /tareas/completadas` y `GET /tareas/pendientes`: Rutas especializadas para las consultas filtradas.
* `PUT /tareas/:nombre`: Actualiza un recurso existente en su totalidad.
* `DELETE /tareas/:nombre`: Elimina el recurso especificado.

---

## Fundamentación de Diseño y Modelado

Para modelar la información y exponer la funcionalidad requerida, se tomaron las siguientes decisiones de arquitectura:

### Estructura de Datos y Persistencia
Se utilizó un arreglo unidimensional en memoria (`const tareas = []`). Cada objeto insertado cuenta estrictamente con dos propiedades:
* `nombre` (String): Actúa como el contenido de la tarea y, a la vez, como identificador único.
* `completada` (Boolean): Se eligió un tipo lógico nativo (`true`/`false`) en lugar de strings ("si"/"no") para eficientizar el almacenamiento y simplificar las evaluaciones condicionales internas.

### Uso del Nombre como Parámetro de Ruta (`Params`)
Dado que la consigna prohíbe explícitamente que existan tareas con el mismo nombre, se decidió utilizar el propio nombre como clave primaria. Por lo tanto, las acciones que mutan un registro específico (`PUT` y `DELETE`) reciben el identificador a través del parámetro de ruta `/:nombre` (ej: `/tareas/Hacer%20TP1`).

### Estrategia para Diferenciar Consultas
La consigna exige facilitar consultas que diferencien completadas de pendientes. Para resolverlo, en lugar de sobrecargar la ruta principal con lógicas complejas, se diseñaron dos endpoints descriptivos (`/tareas/completadas` y `/tareas/pendientes`). Estos procesan la colección utilizando el método inmutable `Array.prototype.filter()`, separando las responsabilidades y haciendo la API más intuitiva para el cliente.

---

## Validación de Valores (Params y Body)

Se implementó un estricto control de flujo para garantizar que todos los datos manipulados se encuentren dentro de valores válidos, respondiendo con los códigos de estado HTTP semánticos adecuados:

* **Validación de Datos Entrantes (Body):**
  En los métodos `POST` y `PUT`, se exige que el campo `nombre` no sea nulo ni vacío. Si esta validación falla, se interrumpe el flujo y se retorna `400 Bad Request`.
* **Manejo de Valores por Defecto:**
  Si el cliente envía una nueva tarea omitiendo el estado (`completada`), el operador *Nullish Coalescing* (`?? false`) le asigna automáticamente el valor `false`, asumiendo que toda tarea nueva nace pendiente.
* **Control de Duplicados (Restricción de Integridad):**
  Al crear o modificar, la API recorre el arreglo interno mediante `.some()`, aplicando `.toLowerCase()` tanto al valor guardado como al entrante. Esto previene que se vulneren las reglas de unicidad mediante el uso engañoso de mayúsculas (ej: "Tarea 1" vs "tarea 1"). Si hay colisión, se rechaza la petición con `409 Conflict`.
* **Validación de Existencia (Params):**
  En `PUT` y `DELETE`, se captura `req.params.nombre` y se busca su índice en el arreglo con `.findIndex()`. Si la tarea solicitada no existe, se rechaza la operación con `404 Not Found`.