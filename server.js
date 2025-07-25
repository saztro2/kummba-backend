// --- IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- CONFIGURACIÓN DE LA APP ---
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conexión a MongoDB Atlas exitosa!'))
    .catch(error => console.error('Error al conectar a MongoDB:', error));

// --- MODELO DEL MENÚ ---
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'available' },
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// --- MODELO DE PEDIDOS ---
const orderSchema = new mongoose.Schema({
    displayId: { type: String, required: true },
    customer: {
        name: { type: String, required: true }
    },
    items: [{
        name: { type: String },
        quantity: { type: Number }
    }],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'ready'],
        default: 'new'
    }
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// --- RUTAS DE LA API DEL MENÚ ---

app.get('/api/menu-items', async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los platos' });
    }
});
app.post('/api/menu-items', async (req, res) => {
    try {
        const newItem = new MenuItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error al guardar el plato' });
    }
});
app.put('/api/menu-items/:id', async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Plato no encontrado' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el plato' });
    }
});
app.delete('/api/menu-items/:id', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Plato no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plato' });
    }
});
app.patch('/api/menu-items/:id/status', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Plato no encontrado' });
        const newStatus = item.status === 'available' ? 'unavailable' : 'available';
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del plato' });
    }
});

// --- RUTAS DE LA API DE PEDIDOS ---

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos' });
    }
});
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del pedido' });
    }
});
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el pedido' });
    }
});

// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de Kummba corriendo en http://localhost:${PORT}`);
});
