// server/utils/validationSchemas.js
import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
    })
});

export const orderSchema = Joi.object({
    user: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid user ID format',
        'any.required': 'User ID is required'
    }),
    orderItems: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            price: Joi.number().min(0).required(),
            itemType: Joi.string().valid('Product', 'MealPackage').required(),
            item: Joi.string().hex().length(24).required(),
            quantity: Joi.number().min(1).required(),
            packageSelections: Joi.array().items(
                Joi.object({
                    category: Joi.string().required(),
                    selectedOptions: Joi.array().items(
                        Joi.object({
                            _id: Joi.string().hex().length(24).required(),
                            name: Joi.string().required()
                        })
                    )
                })
            )
        })
    ).min(1).required(),
    shippingDetails: Joi.object({
        customerName: Joi.string().required(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
            'string.pattern.base': 'Phone must be a valid 10-digit number'
        }),
        city: Joi.string().required(),
        streetAddress: Joi.string().required(),
        apartment: Joi.string().optional(),
        floor: Joi.string().optional()
    }).required(),
    deliveryDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        'string.pattern.base': 'Delivery date must be in YYYY-MM-DD format'
    }),
    fulfillmentType: Joi.string().valid('Delivery', 'Pickup').required(),
    fulfillmentDetails: Joi.string().required(),
    notes: Joi.string().optional()
});