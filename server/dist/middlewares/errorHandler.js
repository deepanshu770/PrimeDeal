"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../utils/asyncHandler");
function errorHandler(err, req, res, next) {
    var _a;
    console.error("🔥 Error caught by middleware:", err);
    let statusCode = 500;
    let message = "Internal Server Error";
    if (err instanceof asyncHandler_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = 400;
                message = `Unique constraint failed on fields: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.target}`;
                break;
            case "P2025":
                statusCode = 404;
                message = "Record not found";
                break;
            default:
                message = `Database error: ${err.message}`;
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid data passed to Prisma query";
    }
    else if (err.name === "ZodError") {
        statusCode = 400;
        return res.status(statusCode).json({
            ok: false,
            errors: err.errors,
        });
    }
    else if (err instanceof Error) {
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
}
