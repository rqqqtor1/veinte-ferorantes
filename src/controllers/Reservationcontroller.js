const Reservation = require('../models/Reservation');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');

// Get all reservations
const getAllReservations = async (req, res) => {
  try {
    const { clientId, status, service, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (status) filter.status = status;
    if (service) filter.service = service;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(filter)
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message
    });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('clientId', 'name email phone');
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva',
      error: error.message
    });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { clientId, vehicle, service, status, serviceDate, notes } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Create new reservation
    const reservation = new Reservation({
      clientId,
      vehicle,
      service,
      status: status || 'Pendiente',
      serviceDate,
      notes
    });

    await reservation.save();

    // Populate client information
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('clientId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: populatedReservation
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al crear reserva',
      error: error.message
    });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { clientId, vehicle, service, status, serviceDate, notes } = req.body;
    const reservationId = req.params.id;

    // Check if reservation exists
    const existingReservation = await Reservation.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Check if reservation can be modified
    if (!existingReservation.canBeModified() && status !== existingReservation.status) {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar una reserva en estado: ' + existingReservation.status
      });
    }

    // Verify client exists if clientId is being changed
    if (clientId && clientId !== existingReservation.clientId.toString()) {
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
    }

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { clientId, vehicle, service, status, serviceDate, notes },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone');

    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: reservation
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reserva',
      error: error.message
    });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Check if reservation can be cancelled
    if (!reservation.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una reserva en estado: ' + reservation.status
      });
    }

    await Reservation.findByIdAndDelete(reservationId);

    res.json({
      success: true,
      message: 'Reserva eliminada exitosamente'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reserva',
      error: error.message
    });
  }
};

// Get reservations by client
const getReservationsByClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { status, service, page = 1, limit = 10 } = req.query;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Build filter
    const filter = { clientId };
    if (status) filter.status = status;
    if (service) filter.service = service;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(filter)
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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
      message: 'Error al obtener reservas del cliente',
      error: error.message
    });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Check if reservation can be cancelled
    if (!reservation.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una reserva en estado: ' + reservation.status
      });
    }

    reservation.status = 'Cancelada';
    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('clientId', 'name email phone');

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: populatedReservation
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al cancelar reserva',
      error: error.message
    });
  }
};

// Get reservation statistics
const getReservationStats = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    
    const statusStats = await Reservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const serviceStats = await Reservation.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Reservation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      success: true,
      data: {
        totalReservations,
        statusStats,
        serviceStats,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de reservas',
      error: error.message
    });
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByClient,
  cancelReservation,
  getReservationStats
};