"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const shop_route_1 = __importDefault(require("./routes/shop.route"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const address_route_1 = __importDefault(require("./routes/address.route"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middlewares/errorHandler");
const order_route_1 = __importDefault(require("./routes/order.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const DIRNAME = path_1.default.resolve();
// default middlewares
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: ["http://localhost:5173",
        "http://192.168.137.1:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)());
//api
app.use("/api/v1/user", user_route_1.default);
app.use("/api/v1/shop", shop_route_1.default);
app.use("/api/v1/product", product_route_1.default);
app.use("/api/v1/address", address_route_1.default);
app.use("/api/v1/order", order_route_1.default);
app.use("/api/v1/admin", admin_route_1.default);
app.use(express_1.default.static(path_1.default.join(DIRNAME, "/client/dist")));
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
