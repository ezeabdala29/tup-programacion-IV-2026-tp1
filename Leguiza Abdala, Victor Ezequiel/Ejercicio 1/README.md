# Ejercicio 1 - API de Rectángulos

API desarrollada con Express.js diseñada para calcular el perímetro y la superficie de figuras rectangulares, incluyendo lógica interna para detectar si las medidas ingresadas constituyen un cuadrado.

## Fundamentación de Diseño

Para modelar la información y exponer la funcionalidad requerida, se tomaron las siguientes decisiones de arquitectura:

* **Método HTTP (GET):** Se implementó el método `GET` ya que el recurso solicitado es un cálculo matemático que no genera persistencia de datos. La API procesa la información en memoria y la devuelve sin alterar ni crear registros en el servidor, respetando la idempotencia característica de este método.
* **Manejo de Parámetros (Query Strings):** Los datos ingresan a través de `req.query` (ej: `?base=4&altura=6`). Esta decisión permite mantener el endpoint limpio (`/api/rectangulo`) y manejar de forma nativa la ausencia de variables. Si se hubieran utilizado parámetros de ruta (`/:base/:altura`), la falta de un dato habría provocado un error `404 Not Found` en el ruteo de Express, en lugar de permitirnos devolver un mensaje de validación personalizado.
* **Validación Temprana (Early Return):** Se estructuró el código para interceptar primero los errores lógicos. Se verifica la existencia de los datos y, posteriormente, que sean numéricos y positivos. Al detectar una anomalía, se corta la ejecución inmediatamente devolviendo un código `400 Bad Request`.
* **Respuestas Estructuradas:** Toda la comunicación se realiza mediante objetos JSON. Las peticiones exitosas devuelven un código `200 OK` con los resultados desglosados, y las fallidas devuelven un objeto con la propiedad `error` para facilitar su lectura en el frontend.