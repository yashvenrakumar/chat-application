"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const notification_controller_1 = require("../controllers/notification.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const push_subscription_validator_1 = require("../validators/push-subscription.validator");
const ensureJsonObjectBody = (req, _res, next) => {
    if (req.body == null || typeof req.body !== "object")
        req.body = {};
    next();
};
const notificationRouter = (0, express_1.Router)();
notificationRouter.post("/push/subscribe", (0, validate_middleware_1.validateBody)(push_subscription_validator_1.pushSubscribeBodySchema), (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.pushSubscribe));
notificationRouter.delete("/push/subscribe", ensureJsonObjectBody, (0, validate_middleware_1.validateBody)(push_subscription_validator_1.pushUnsubscribeBodySchema), (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.pushUnsubscribe));
notificationRouter.get("/", (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.list));
notificationRouter.post("/:ntf_id/read", (0, asyncHandler_1.asyncHandler)(notification_controller_1.NotificationController.markRead));
exports.default = notificationRouter;
