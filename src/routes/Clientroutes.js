import express from 'express';
import clientController from '../controllers/Clientcontroller.js';
import { validateClient, validateUpdateClient, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// GET all clients
router.get('/', clientController.getAllClients);

// POST create client
router.post('/', validateClient, handleValidationErrors, clientController.createClient);

// GET client stats (DEBE ir antes que /:id)
router.get('/:id/stats', clientController.getClientStats);

// GET client by ID
router.get('/:id', clientController.getClientById);

// PUT update client
router.put('/:id', validateUpdateClient, handleValidationErrors, clientController.updateClient);

// DELETE client
router.delete('/:id', clientController.deleteClient);

export default router;