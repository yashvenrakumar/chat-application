import Joi from "joi";

export const createUserSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  email_id: Joi.string().email().required(),
 });
