const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/Reservationcontroller.js');
const { validateReservation, validateUpdateReservation } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - clientId
 *         - vehicle
 *         - service
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la reserva
 *         clientId:
 *           type: string
 *           description: ID del cliente
 *         vehicle:
 *           type: string
 *           description: Vehículo del cliente
 *           minLength: 2
 *           maxLength: 100
 *         service:
 *           type: string
 *           enum: [Mantenimiento, Reparación, Revisión, Cambio de aceite, Frenos, Suspensión, Motor, Transmisión]
 *           description: Tipo de servicio
 *         status:
 *           type: string
 *           enum: [Pendiente, Confirmada, En proceso, Completada, Cancelada]
 *           description: Estado de la reserva
 *           default: Pendiente
 *         serviceDate:
 *           type: string
 *           format: date-time
 *           description: Fecha programada del servicio
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *           maxLength: 500
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     ReservationStats:
 *       type: object
 *       properties:
 *         totalReservations:
 *           type: number
 *         statusStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               count:
 *                 type: number
 *         serviceStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               count:
 *                 type: number
 *         monthlyStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: number
 *                   month:
 *                     type: number
 *               count:
 *                 type: number
 *   responses:
 *     ReservationNotFound:
 *       description: Reserva no encontrada
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Reserva no encontrada
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Obtiene todas las reservas
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: ID del cliente para filtrar reservas
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendiente, Confirmada, En proceso, Completada, Cancelada]
 *         description: Estado para filtrar reservas
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *           enum: [Mantenimiento, Reparación, Revisión, Cambio de aceite, Frenos, Suspensión, Motor, Transmisión]
 *         description: Servicio para filtrar reservas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 */
router.get('/', reservationController.getAllReservations);

/**
 * @swagger
 * /reservations/stats:
 *   get:
 *     summary: Obtiene estadísticas de reservas
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Estadísticas de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReservationStats'
 */
router.get('/stats', reservationController.getReservationStats);

/**
 * @swagger
 * /reservations/client/{clientId}:
 *   get:
 *     summary: Obtiene reservas de un cliente específico
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendiente, Confirmada, En proceso, Completada, Cancelada]
 *         description: Estado para filtrar reservas
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *           enum: [Mantenimiento, Reparación, Revisión, Cambio de aceite, Frenos, Suspensión, Motor, Transmisión]
 *         description: Servicio para filtrar reservas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de reservas del cliente
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/client/:clientId', reservationController.getReservationsByClient);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Obtiene una reserva por ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         $ref: '#/components/responses/ReservationNotFound'
 */
router.get('/:id', reservationController.getReservationById);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crea una nueva reserva
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *           example:
 *             clientId: "64f8a1b2c3d4e5f6a7b8c9d0"
 *             vehicle: "Toyota Corolla 2020"
 *             service: "Mantenimiento"
 *             status: "Pendiente"
 *             serviceDate: "2024-12-20T10:00:00.000Z"
 *             notes: "Revisar frenos también"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente no encontrado
 */
router.post('/', validateReservation, reservationController.createReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Actualiza una reserva
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       404:
 *         $ref: '#/components/responses/ReservationNotFound'
 *       400:
 *         description: Error de validación o reserva no modificable
 */
router.put('/:id', validateUpdateReservation, reservationController.updateReservation);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela una reserva
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       404:
 *         $ref: '#/components/responses/ReservationNotFound'
 *       400:
 *         description: Reserva no puede ser cancelada
 */
router.patch('/:id/cancel', reservationController.cancelReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Elimina una reserva
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       404:
 *         $ref: '#/components/responses/ReservationNotFound'
 *       400:
 *         description: Reserva no puede ser eliminada
 */
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;