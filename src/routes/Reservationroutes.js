import express from 'express';
import reservationController from '../controllers/Reservationcontroller.js';
import { validateReservation, validateUpdateReservation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// GET all reservations
router.get('/', reservationController.getAllReservations);

// POST create reservation
router.post('/', validateReservation, handleValidationErrors, reservationController.createReservation);

// GET reservation stats (DEBE ir antes que /:id)
router.get('/stats', reservationController.getReservationStats);

// GET reservations by client (DEBE ir antes que /:id)
router.get('/client/:clientId', reservationController.getReservationsByClient);

// PATCH cancel reservation (DEBE ir antes que /:id)
router.patch('/:id/cancel', reservationController.cancelReservation);

// GET reservation by ID
router.get('/:id', reservationController.getReservationById);

// PUT update reservation
router.put('/:id', validateUpdateReservation, handleValidationErrors, reservationController.updateReservation);

// DELETE reservation
router.delete('/:id', reservationController.deleteReservation);

export default router;