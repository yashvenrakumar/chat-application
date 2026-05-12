"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const group_service_1 = require("../services/group.service");
class GroupController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const payload = req.validated;
            const group = yield group_service_1.GroupService.createGroup(auth_user_id, payload);
            res.status(201).json((0, apiResponse_1.successResponse)("Group created successfully", group));
        });
    }
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const payload = req.validated;
            const group = yield group_service_1.GroupService.updateGroup(group_id, auth_user_id, payload.group_title);
            res.status(200).json((0, apiResponse_1.successResponse)("Group updated successfully", group));
        });
    }
    static addMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const payload = req.validated;
            yield group_service_1.GroupService.addMembers(group_id, auth_user_id, payload.user_ids);
            res.status(200).json((0, apiResponse_1.successResponse)("Members added successfully"));
        });
    }
    static removeMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const user_id = Number(req.params.user_id);
            yield group_service_1.GroupService.removeMember(group_id, auth_user_id, user_id);
            res.status(200).json((0, apiResponse_1.successResponse)("Member removed successfully"));
        });
    }
    static myGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const groups = yield group_service_1.GroupService.listMyGroups(auth_user_id);
            res
                .status(200)
                .json((0, apiResponse_1.successResponse)("Groups fetched successfully", groups));
        });
    }
    static members(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const group_id = Number(req.params.group_id);
            const members = yield group_service_1.GroupService.listGroupMembers(group_id);
            res
                .status(200)
                .json((0, apiResponse_1.successResponse)("Group members fetched successfully", members));
        });
    }
    static changeAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const user_id = Number(req.params.user_id);
            const group = yield group_service_1.GroupService.changeGroupAdmin(group_id, auth_user_id, user_id);
            res
                .status(200)
                .json((0, apiResponse_1.successResponse)("Group admin changed successfully", group));
        });
    }
}
exports.GroupController = GroupController;
