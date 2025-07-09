import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El ID del cliente es obligatorio']
  },
  vehicle: {
    type: String,
    required: [true, 'El vehículo es obligatorio'],
    trim: true,
    minlength: [2, 'El vehículo debe tener al menos 2 caracteres'],
    maxlength: [100, 'El vehículo no puede exceder 100 caracteres']
  },
  service: {
    type: String,
    required: [true, 'El servicio es obligatorio'],
    enum: {
      values: ['Mantenimiento', 'Reparación', 'Revisión', 'Cambio de aceite', 'Frenos', 'Suspensión', 'Motor', 'Transmisión'],
      message: 'El servicio debe ser uno de los valores permitidos'
    },
    trim: true
  },
  status: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: ['Pendiente', 'Confirmada', 'En proceso', 'Completada', 'Cancelada'],
      message: 'El estado debe ser uno de los valores permitidos'
    },
    default: 'Pendiente'
  },
  serviceDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // If serviceDate is provided, it should be in the future
        if (value) {
          return value > new Date();
        }
        return true;
      },
      message: 'La fecha del servicio debe ser futura'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  }
}, {
  timestamps: true
});

// Virtual for client information
reservationSchema.virtual('client', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

// Static method to find by client
reservationSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId }).populate('clientId', 'name email phone');
};

// Static method to find by status
reservationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('clientId', 'name email phone');
};

// Static method to find by service type
reservationSchema.statics.findByService = function(service) {
  return this.find({ service }).populate('clientId', 'name email phone');
};

// Instance method to check if reservation can be cancelled
reservationSchema.methods.canBeCancelled = function() {
  return ['Pendiente', 'Confirmada'].includes(this.status);
};

// Instance method to check if reservation can be modified
reservationSchema.methods.canBeModified = function() {
  return ['Pendiente', 'Confirmada'].includes(this.status);
};

// Pre-save middleware to validate business rules
reservationSchema.pre('save', async function(next) {
  // Check if client exists
  if (this.isNew || this.isModified('clientId')) {
    const Client = mongoose.model('Client');
    const client = await Client.findById(this.clientId);
    if (!client) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      return next(error);
    }
  }

  // If status is being changed to 'Completada', ensure serviceDate is set
  if (this.isModified('status') && this.status === 'Completada' && !this.serviceDate) {
    this.serviceDate = new Date();
  }

  next();
});

// Indexes for better performance
reservationSchema.index({ clientId: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ service: 1 });
reservationSchema.index({ serviceDate: 1 });
reservationSchema.index({ createdAt: -1 });

// Compound index for common queries
reservationSchema.index({ clientId: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);