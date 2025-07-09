import Client from '../models/Client.js';
import Reservation from '../models/Reservation.js';

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clients = await Client.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments();

    res.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un cliente con este email'
      });
    }

    // Create new client
    const client = new Client({
      name,
      email,
      password,
      phone,
      age
    });

    await client.save();

    // Return client without password
    const clientResponse = client.toObject();
    delete clientResponse.password;

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: clientResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un cliente con este email'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;
    const clientId = req.params.id;

    // Check if email is already used by another client
    if (email) {
      const existingClient = await Client.findOne({ 
        email, 
        _id: { $ne: clientId } 
      });
      
      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro cliente con este email'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (phone) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;

    const client = await Client.findByIdAndUpdate(
      clientId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: client
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe otro cliente con este email'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await Client.findByIdAndDelete(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Delete all reservations for this client
    await Reservation.deleteMany({ clientId });

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};

// Get client statistics
const getClientStats = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await Client.findById(clientId).select('-password');
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const reservations = await Reservation.find({ clientId });
    
    const stats = {
      totalReservations: reservations.length,
      pendingReservations: reservations.filter(r => r.status === 'Pendiente').length,
      confirmedReservations: reservations.filter(r => r.status === 'Confirmada').length,
      inProgressReservations: reservations.filter(r => r.status === 'En proceso').length,
      completedReservations: reservations.filter(r => r.status === 'Completada').length,
      cancelledReservations: reservations.filter(r => r.status === 'Cancelada').length,
      serviceBreakdown: {},
      recentReservations: reservations.slice(-5) // Last 5 reservations
    };

    // Count services
    reservations.forEach(reservation => {
      if (stats.serviceBreakdown[reservation.service]) {
        stats.serviceBreakdown[reservation.service]++;
      } else {
        stats.serviceBreakdown[reservation.service] = 1;
      }
    });

    res.json({
      success: true,
      data: {
        client,
        stats
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del cliente',
      error: error.message
    });
  }
};

export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
};