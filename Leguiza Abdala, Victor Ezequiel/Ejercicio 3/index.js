const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

const tareas = [];

app.get("/tareas", (req, res) => {
    res.json(tareas);
});

app.post("/tareas", (req, res) => {
    const { nombre, completada } = req.body;

    if (!nombre) {
        return res.status(400).json({
            error: "El nombre de la tarea es obligatorio"
        });
    }

    const existe = tareas.some(
        tarea => tarea.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
        return res.status(409).json({
            error: "Ya existe una tarea con ese nombre"
        });
    }

    const nuevaTarea = {
        nombre: nombre,
        completada: completada ?? false
    };

    tareas.push(nuevaTarea);
    res.status(201).json(nuevaTarea);
});

app.get("/tareas/completadas", (req, res) => {
    const completadas = tareas.filter(tarea => tarea.completada === true);
    res.json(completadas);
});

app.get("/tareas/pendientes", (req, res) => {
    const pendientes = tareas.filter(tarea => tarea.completada === false);
    res.json(pendientes);
});

app.put("/tareas/:nombre", (req, res) => {
    const nombreParam = req.params.nombre;
    const { nombre, completada } = req.body;

    const indice = tareas.findIndex(
        tarea => tarea.nombre.toLowerCase() === nombreParam.toLowerCase()
    );

    if (indice === -1) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    if (!nombre) {
        return res.status(400).json({ error: "El nombre de la tarea es obligatorio" });
    }

    if (nombre.toLowerCase() !== nombreParam.toLowerCase()) {
        const existe = tareas.some(
            tarea => tarea.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (existe) {
            return res.status(409).json({ error: "Ya existe otra tarea con ese nuevo nombre" });
        }
    }

    tareas[indice] = {
        nombre: nombre,
        completada: completada ?? false
    };

    res.json(tareas[indice]);
});

app.delete("/tareas/:nombre", (req, res) => {
    const nombreParam = req.params.nombre;

    const indice = tareas.findIndex(
        tarea => tarea.nombre.toLowerCase() === nombreParam.toLowerCase()
    );

    if (indice === -1) {
        return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const eliminada = tareas.splice(indice, 1)[0];
    res.json(eliminada);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});