const express = require("express");

const app = express();
app.use(express.json());

const PORT = 3000;

const alumnos = [];
let siguienteId = 1;

function normalizarNombre(nombre) {
  return typeof nombre === "string" ? nombre.trim() : "";
}

function esNotaValida(nota) {
  return typeof nota === "number" && Number.isFinite(nota) && nota >= 0 && nota <= 10;
}

function calcularPromedio(notas) {
  return Number(((notas[0] + notas[1] + notas[2]) / 3).toFixed(2));
}

function calcularCondicion(promedio) {
  if (promedio < 6) return "reprobado";
  if (promedio < 8) return "aprobado";
  return "promocionado";
}

function enriquecer(alumno) {
  const promedio = calcularPromedio(alumno.notas);
  return {
    id: alumno.id,
    nombre: alumno.nombre,
    notas: [...alumno.notas],
    promedio,
    condicion: calcularCondicion(promedio),
  };
}

function validarDatos(body, { idActual = null } = {}) {
  const nombre = normalizarNombre(body?.nombre);
  const { notas } = body ?? {};

  if (!nombre) {
    return "nombre es obligatorio y no puede estar vacío";
  }

  if (!Array.isArray(notas) || notas.length !== 3) {
    return "notas debe ser un arreglo con exactamente 3 valores";
  }

  if (!notas.every(esNotaValida)) {
    return "cada nota debe ser un número entre 0 y 10";
  }

  const duplicado = alumnos.some(
    (a) =>
      a.id !== idActual &&
      a.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (duplicado) {
    return "ya existe un alumno con ese nombre";
  }

  return null;
}

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

app.get("/alumnos", (_req, res) => {
  res.json(alumnos.map(enriquecer));
});

app.get("/alumnos/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id debe ser un entero positivo" });
  }

  const alumno = alumnos.find((a) => a.id === id);
  if (!alumno) {
    return res.status(404).json({ error: "alumno no encontrado" });
  }

  res.json(enriquecer(alumno));
});

app.post("/alumnos", (req, res) => {
  const error = validarDatos(req.body);
  if (error) {
    const status = error.includes("ya existe") ? 409 : 400;
    return res.status(status).json({ error });
  }

  const nuevo = {
    id: siguienteId++,
    nombre: normalizarNombre(req.body.nombre),
    notas: [...req.body.notas],
  };

  alumnos.push(nuevo);
  res.status(201).json(enriquecer(nuevo));
});

app.put("/alumnos/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id debe ser un entero positivo" });
  }

  const indice = alumnos.findIndex((a) => a.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: "alumno no encontrado" });
  }

  const error = validarDatos(req.body, { idActual: id });
  if (error) {
    const status = error.includes("ya existe") ? 409 : 400;
    return res.status(status).json({ error });
  }

  alumnos[indice] = {
    id,
    nombre: normalizarNombre(req.body.nombre),
    notas: [...req.body.notas],
  };

  res.json(enriquecer(alumnos[indice]));
});

app.delete("/alumnos/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id debe ser un entero positivo" });
  }

  const indice = alumnos.findIndex((a) => a.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: "alumno no encontrado" });
  }

  const eliminado = alumnos.splice(indice, 1)[0];
  res.json(enriquecer(eliminado));
});

app.listen(PORT, () => {
  console.log(`API Ejercicio 2 escuchando en http://localhost:${PORT}`);
});