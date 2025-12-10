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
exports.setDefaultAddress = exports.listAddresses = exports.deleteAddress = exports.updateAddress = exports.addAddress = void 0;
const db_1 = require("../db/db");
const asyncHandler_1 = require("../utils/asyncHandler");
// ----------------- Add New Address -----------------
exports.addAddress = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
    const userId = Number(req.id);
    if (!addressLine1 || !city || !state || !postalCode || !country) {
        throw new asyncHandler_1.AppError("Required fields missing", 400);
    }
    if (isDefault) {
        yield db_1.prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }
    const newAddress = yield db_1.prisma.address.create({
        data: {
            userId,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            isDefault: !!isDefault,
        },
    });
    res.status(201).json({ success: true, message: "Address added successfully", address: newAddress });
}));
// ----------------- Update Address -----------------
exports.updateAddress = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;
    const userId = Number(req.id);
    const address = yield db_1.prisma.address.findUnique({ where: { id: Number(id) } });
    if (!address || address.userId !== userId)
        throw new asyncHandler_1.AppError("Address not found", 404);
    if (isDefault) {
        yield db_1.prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }
    const updatedAddress = yield db_1.prisma.address.update({
        where: { id: address.id },
        data: {
            addressLine1: addressLine1 || address.addressLine1,
            addressLine2: addressLine2 || address.addressLine2,
            city: city || address.city,
            state: state || address.state,
            postalCode: postalCode || address.postalCode,
            country: country || address.country,
            latitude: latitude !== undefined ? parseFloat(latitude) : address.latitude,
            longitude: longitude !== undefined ? parseFloat(longitude) : address.longitude,
            isDefault: isDefault !== undefined ? !!isDefault : address.isDefault,
        },
    });
    res.status(200).json({ success: true, message: "Address updated successfully", address: updatedAddress });
}));
// ----------------- Delete Address -----------------
exports.deleteAddress = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = Number(req.id);
    const address = yield db_1.prisma.address.findUnique({ where: { id: Number(id) } });
    if (!address || address.userId !== userId)
        throw new asyncHandler_1.AppError("Address not found", 404);
    yield db_1.prisma.address.delete({ where: { id: address.id } });
    res.status(200).json({ success: true, message: "Address deleted successfully" });
}));
// ----------------- List All Addresses -----------------
exports.listAddresses = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.id);
    const addresses = yield db_1.prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" }, // default address first
    });
    res.status(200).json({ success: true, addresses });
}));
// ----------------- Set Default Address -----------------
exports.setDefaultAddress = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = Number(req.id);
    const address = yield db_1.prisma.address.findUnique({ where: { id: Number(id) } });
    if (!address || address.userId !== userId)
        throw new asyncHandler_1.AppError("Address not found", 404);
    yield db_1.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
    });
    const updatedAddress = yield db_1.prisma.address.update({
        where: { id: address.id },
        data: { isDefault: true },
    });
    res.status(200).json({ success: true, message: "Default address set successfully", address: updatedAddress });
}));
