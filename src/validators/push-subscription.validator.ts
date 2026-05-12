import Joi from "joi";

export const pushSubscribeBodySchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    p256dh: Joi.string().required(),
    auth: Joi.string().required(),
  })
    .required()
    .unknown(true),
  expirationTime: Joi.number().allow(null).optional(),
}).unknown(true);

export const pushUnsubscribeBodySchema = Joi.object({
  endpoint: Joi.string().uri().optional(),
}).unknown(true);
