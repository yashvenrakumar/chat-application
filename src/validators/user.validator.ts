import Joi from "joi";

export const createUserSchema = Joi.object({
  fst_nm: Joi.string().min(2).max(100).required(),
  lst_nm: Joi.string().min(1).max(100).required(),
  email_id: Joi.string().email().required(),
  mob_no: Joi.string().min(7).max(20).optional(),
});
