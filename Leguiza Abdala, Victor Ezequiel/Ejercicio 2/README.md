# Ejercicio 2 - API de Gestión de Alumnos

Este proyecto implementa una API REST desarrollada con ExpressJS para administrar la información académica de los alumnos de una materia, cumpliendo con los requisitos de persistencia en memoria, validación estricta de datos y cálculo de propiedades derivadas en tiempo de ejecución.

## Cumplimiento de Indicaciones Generales

* **Estructura de Archivos:** Se respetó la estructura del repositorio aislando la solución dentro de la carpeta `Ejercicio 2`, incluyendo su propio `package.json` y configurando `.gitignore` para omitir `node_modules`.
* **Archivo de Pruebas:** Se incluye el archivo `alumnos.http` configurado con la extensión REST Client, que contiene todos los escenarios de prueba (casos de éxito y validación de errores) para cada método HTTP desarrollado.
* **Validaciones Estrictas:** Se implementaron controles de formato, rango y tipo de dato sobre los `body` entrantes y los `params` de las rutas, devolviendo los códigos de estado HTTP correspondientes ante datos inválidos.

---

## Métodos HTTP y Recursos Explotados

Se definió el recurso en plural `/alumnos` siguiendo los estándares RESTful.

* `GET /alumnos`: Retorna el listado completo de alumnos.
* `GET /alumnos/:id`: Retorna la información de un alumno específico.
* `POST /alumnos`: Crea un nuevo registro validando que el nombre no exista.
* `PUT /alumnos/:id`: Modifica un alumno existente, comprobando colisiones de nombres.
* `DELETE /alumnos/:id`: Elimina un alumno del registro.

---

## Fundamentación de Diseño y Lógica de Negocio

Para cumplir con la consigna específica del Ejercicio 2, se tomaron las siguientes decisiones de arquitectura:

### 1. Modelo de Datos y Almacenamiento Interno
La información se conserva en un arreglo interno en memoria. Respetando el enunciado, los objetos almacenados solo contienen `{ id, nombre, notas }`. Se incluyó un `id` numérico autoincremental como identificador interno para garantizar un manejo ordenado de las operaciones de actualización y borrado.

### 2. Cálculo de Datos Derivados al Vuelo
La consigna establece que el promedio y la condición académica (reprobado, aprobado, promocionado) **no deben almacenarse en el arreglo**. 
Para solucionarlo, se diseñó la función `enriquecer(alumno)`. Esta función actúa como un middleware lógico justo antes de enviar la respuesta (`res.json()`). Toma los datos crudos de la memoria, calcula el promedio, evalúa la condición mediante sentencias `if`, y ensambla el JSON final que ve el cliente. Los datos derivados nunca tocan la memoria del servidor.

### 3. Uso de Parámetros de Ruta (`params`)
Aunque los nombres de los alumnos no pueden repetirse, se decidió utilizar el parámetro de ruta numérico `/:id` en lugar de `/:nombre` para realizar las búsquedas, modificaciones y eliminaciones. Esta decisión evita problemas de codificación de URLs (caracteres especiales, tildes, espacios) comunes al pasar nombres completos en la barra de direcciones. Se utiliza la función `parseId()` para garantizar que el parámetro ingresado sea un número entero positivo válido.

### 4. Validaciones y Manejo de Errores (Body)
La función `validarDatos()` se encarga de auditar las peticiones `POST` y `PUT` antes de procesarlas:
* **Cantidades y Tipos:** Se verifica que el campo `notas` sea un arreglo estricto de longitud 3 (`notas.length !== 3`), y que cada elemento sea de tipo `number`.
* **Reglas de Negocio (Rango):** Se controla mediante `Number.isFinite()` y validaciones lógicas que las notas estén siempre entre 0 y 10. Si falla, se devuelve un `400 Bad Request`.
* **Control de Duplicados:** Se utiliza el método `.some()` para recorrer el arreglo interno y verificar si el nombre entrante ya existe (convirtiéndolo a minúsculas con `toLowerCase()` para evitar engaños por mayúsculas). Si se detecta un duplicado, la petición se aborta retornando un error `409 Conflict`.