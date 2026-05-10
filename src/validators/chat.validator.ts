import Joi from "joi";

export const sendMessageSchema = Joi.object({
  message_text: Joi.string().min(1).max(2000).required(),
});
