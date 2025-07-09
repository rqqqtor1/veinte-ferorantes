import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

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

export {
  handleValidationErrors,
  validateClient,
  validateUpdateClient,
  validateReservation,
  validateUpdateReservation,
  validateMongoId,
  validateClientId,
  validatePagination,
  validateReservationFilters
};