import Joi from "joi";

export const createGroupSchema = Joi.object({
  group_title: Joi.string().min(2).max(120).required(),
  user_ids: Joi.array().items(Joi.number().integer().positive()).default([]),
});

export const updateGroupSchema = Joi.object({
  group_title: Joi.string().min(2).max(120).required(),
});

export const addGroupMembersSchema = Joi.object({
  user_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});
