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
    orderItems: Joi.array().items(
        Joi.object({
            _id: Joi.string().required(),
            name: Joi.alternatives().try(
                Joi.string(),
                Joi.object({ he: Joi.string().allow(''), en: Joi.string().allow('') })
            ).required(),
            price: Joi.number().min(0).required(),
            type: Joi.string().valid('product', 'package').optional(),
            itemType: Joi.string().valid('Product', 'MealPackage').optional(),
            quantity: Joi.number().min(1).optional(),
            userChoices: Joi.array().optional(),
            packageSelections: Joi.array().optional(),
        }).unknown(true)
    ).min(1).required(),
    shippingDetails: Joi.object({
        customerName: Joi.string().required(),
        phone: Joi.string().pattern(/^[0-9]{9,11}$/).required().messages({
            'string.pattern.base': 'מספר טלפון חייב להיות בין 9-11 ספרות'
        }),
        email: Joi.string().email().optional(),
        city: Joi.string().allow('').optional(),
        streetAddress: Joi.string().allow('').optional(),
        apartment: Joi.string().allow('').optional(),
        floor: Joi.string().allow('').optional()
    }).required(),
    deliveryDate: Joi.string().required(),
    fulfillmentType: Joi.string().valid('Delivery', 'Pickup').required(),
    fulfillmentDetails: Joi.string().required(),
    notes: Joi.string().allow('').optional(),
    itemsPrice: Joi.number().optional(),
    shippingPrice: Joi.number().optional(),
    discountAmount: Joi.number().optional(),
    couponCode: Joi.string().allow('', null).optional(),
    totalPrice: Joi.number().optional(),
});