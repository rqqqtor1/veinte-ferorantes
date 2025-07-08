const express = require('express');
const router = express.Router();
const clientController = require('../controllers/Clientcontroller.js');
const { validateClient, validateUpdateClient } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - age
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del cliente
 *         name:
 *           type: string
 *           description: Nombre completo del cliente
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *         password:
 *           type: string
 *           description: Contraseña del cliente
 *           minLength: 6
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *         age:
 *           type: number
 *           description: Edad del cliente
 *           minimum: 18
 *           maximum: 120
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     ClientStats:
 *       type: object
 *       properties:
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         stats:
 *           type: object
 *           properties:
 *             totalReservations:
 *               type: number
 *             pendingReservations:
 *               type: number
 *             completedReservations:
 *               type: number
 *             cancelledReservations:
 *               type: number
 *             serviceBreakdown:
 *               type: object
 *   responses:
 *     ClientNotFound:
 *       description: Cliente no encontrado
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
 *                 example: Cliente no encontrado
 *     ValidationError:
 *       description: Error de validación
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
 *                 example: Errores de validación
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clients]
 *     parameters:
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
 *         description: Lista de todos los clientes
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
 *                     $ref: '#/components/schemas/Client'
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
router.get('/', clientController.getAllClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtiene un cliente por ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         $ref: '#/components/responses/ClientNotFound'
 */
router.get('/:id', clientController.getClientById);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *           example:
 *             name: "Juan Pérez"
 *             email: "juan@email.com"
 *             password: "123456"
 *             phone: "+57 300 123 4567"
 *             age: 30
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
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
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Cliente ya existe
 */
router.post('/', validateClient, clientController.createClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Actualiza un cliente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       404:
 *         $ref: '#/components/responses/ClientNotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/:id', validateUpdateClient, clientController.updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/ClientNotFound'
 */
router.delete('/:id', clientController.deleteClient);

/**
 * @swagger
 * /clients/{id}/stats:
 *   get:
 *     summary: Obtiene estadísticas de un cliente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Estadísticas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClientStats'
 *       404:
 *         $ref: '#/components/responses/ClientNotFound'
 */
router.get('/:id/stats', clientController.getClientStats);

module.exports = router;