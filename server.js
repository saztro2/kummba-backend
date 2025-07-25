// --- 1. IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Carga las variables del archivo .env en process.env

// --- CONFIGURACIÓN DE LA APP ---
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

// --- 2. CONEXIÓN A LA BASE DE DATOS ---
// Usa la "llave" que guardamos en el archivo .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conexión a MongoDB Atlas exitosa!'))
    .catch(error => console.error('Error al conectar a MongoDB:', error));

// --- 3. DEFINIR EL "ESQUEMA" (LA ESTRUCTURA DE LOS DATOS) ---
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'available' },
});

// --- 4. CREAR EL "MODELO" (LA HERRAMIENTA PARA INTERACTUAR) ---
// Con esto, Mongoose creará una colección llamada 'menuitems' en la base de datos.
const MenuItem = mongoose.model('MenuItem', menuItemSchema);


// --- 5. RUTAS DE LA API (AHORA USANDO MONGOOSE Y LA BASE DE DATOS) ---

// RUTA GET: Obtener todos los platos de la base de datos
app.get('/api/menu-items', async (req, res) => {
    try {
        const items = await MenuItem.find(); // Busca todos los documentos en la colección
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los platos' });
    }
});

// RUTA POST: Añadir un nuevo plato a la base de datos
app.post('/api/menu-items', async (req, res) => {
    try {
        const newItem = new MenuItem(req.body); // Crea un nuevo documento con los datos del frontend
        const savedItem = await newItem.save(); // Lo guarda en la base de datos
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error al guardar el plato' });
    }
});

// RUTA PUT: Editar un plato existente en la base de datos
app.put('/api/menu-items/:id', async (req, res) => {
    try {
        // Busca un documento por su ID y lo actualiza con los nuevos datos
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el plato' });
    }
});

// RUTA DELETE: Eliminar un plato de la base de datos
app.delete('/api/menu-items/:id', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Plato no encontrado' });
        res.status(204).send(); // Éxito, sin contenido que devolver
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plato' });
    }
});


// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de Kummba corriendo en http://localhost:${PORT}`);
});