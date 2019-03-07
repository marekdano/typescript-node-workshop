import express from "express";
import bodyParser from "body-parser";
import { createDbConnection } from "./db";
import { getAuthController } from "../controllers/auth_controller";
import { getUserController } from "../controllers/user_controllet";
import { getLinksController } from "../controllers/links_controller";
import { getCommentsController } from "../controllers/comments_controller";

export async function createApp() {

    // Create db connection
    await createDbConnection();

    // Creates app
    const app = express();

    // Server config to be able to send JSON
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Declare main path
    app.get("/", (req, res) => {
        res.send("This is the home page!");
    });

    // Declare controller instances
    const authController = getAuthController();
    const userController = getUserController();
    const linksController = getLinksController();
    const commentsController = getCommentsController();

    // Declare routes
    app.use("/api/v1/auth", authController);
    app.use("/api/v1/users", userController);
    app.use("/api/v1/links", linksController);
    app.use("/api/v1/comments", commentsController);

    return app;
}
