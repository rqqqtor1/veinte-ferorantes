const { body, param, query } = require('express-validator');

// Client validations
const validateClient = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('phone')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Debe ser un número de teléfono válido'),
  body('age')
    .isInt({ min: 18, max: 120 })
    .withMessage('La edad debe ser un número entre 18 y 120')
];

const validateUpdateClient = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Debe ser un número de teléfono válido'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('La edad debe ser un número entre 18 y 120')
];

// Reservation validations
const validateReservation = [
  body('clientId')
    .isMongoId()
    .withMessage('El ID del cliente debe ser válido'),
  body('vehicle')
    .isLength({ min: 2, max: 100 })
    .withMessage('El vehículo debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
  body('service')
    .isIn(['Mantenimiento', 'Reparación', 'Revisión', 'Cambio de aceite', 'Frenos', 'Suspensión', 'Motor', 'Transmisión'])
    .withMessage('El servicio debe ser uno de los valores permitidos'),
  body('status')
    .optional()
    .isIn(['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada'])
    .withMessage('El estado debe ser uno de los valores permitidos'),
  body('serviceDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha del servicio debe ser una fecha válida')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La fecha del servicio debe ser futura');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim()
    .escape()
];

const validateUpdateReservation = [
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('El ID del cliente debe ser válido'),
  body('vehicle')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El vehículo debe tener entre 2 y 100 caracteres')
    .trim()
    .escape(),
  body('service')
    .optional()
    .isIn(['Mantenimiento', 'Reparación', 'Revisión', 'Cambio de aceite', 'Frenos', 'Suspensión', 'Motor', 'Transmisión'])
    .withMessage('El servicio debe ser uno de los valores permitidos'),
  body('status')
    .optional()
    .isIn(['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada'])
    .withMessage('El estado debe ser uno de los valores permitidos'),
  body('serviceDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha del servicio debe ser una fecha válida')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La fecha del servicio debe ser futura');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim()
    .escape()
];

// Parameter validations
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ID de MongoDB válido')
];

const validateClientId = [
  param('clientId')
    .isMongoId()
    .withMessage('El ID del cliente debe ser un ID de MongoDB válido')
];

// Query validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100')
];

const validateReservationFilters = [
  query('status')
    .optional()
    .isIn(['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada'])
    .withMessage('El estado debe ser uno de los valores permitidos'),
  query('service')
    .optional()
    .isIn(['Mantenimiento', 'Reparación', 'Revisión', 'Cambio de aceite', 'Frenos', 'Suspensión', 'Motor', 'Transmisión'])
    .withMessage('El servicio debe ser uno de los valores permitidos'),
  query('clientId')
    .optional()
    .isMongoId()
    .withMessage('El ID del cliente debe ser válido')
];

// Custom validation middleware for file uploads (if needed in the future)
const validateFile = (fieldName, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || !req.files[fieldName]) {
      return next();
    }

    const file = req.files[fieldName];
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

// Business rules validations
const validateBusinessRules = {
  // Check if client can make a reservation
  canMakeReservation: async (req, res, next) => {
    try {
      const { clientId } = req.body;
      const Reservation = require('../models/Reservation');
      
      // Check if client has pending reservations (business rule: max 3 pending)
      const pendingReservations = await Reservation.countDocuments({
        clientId,
        status: 'Pendiente'
      });

      if (pendingReservations >= 3) {
        return res.status(400).json({
          success: false,
          message: 'El cliente no puede tener más de 3 reservas pendientes'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al validar reglas de negocio',
        error: error.message
      });
    }
  },

  // Check if reservation can be modified
  canModifyReservation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const Reservation = require('../models/Reservation');
      
      const reservation = await Reservation.findById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      if (!reservation.canBeModified()) {
        return res.status(400).json({
          success: false,
          message: 'No se puede modificar una reserva en estado: ' + reservation.status
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al validar reglas de negocio',
        error: error.message
      });
    }
  }
};

// Sanitization helpers
const sanitizeHtml = (req, res, next) => {
  // Additional HTML sanitization if needed
  next();
};

const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requests.has(identifier)) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = requests.get(identifier);
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
      });
    }
    
    userRequests.count++;
    next();
  };
};

module.exports = {
  validateClient,
  validateUpdateClient,
  validateReservation,
  validateUpdateReservation,
  validateMongoId,
  validateClientId,
  validatePagination,
  validateReservationFilters,
  validateFile,
  validateBusinessRules,
  sanitizeHtml,
  rateLimitByUser
};