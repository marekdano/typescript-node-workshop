import * as express from "express";
import * as joi from "joi";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { getUserRepository } from "../repositories/user_repository";
import { User, userDetailsSchema } from "../entities/user";
import { AuthTokenContent } from "../config/auth";

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(AUTH_SECRET: string, userRepository: Repository<User>) {

    // Returns a JWT when the user credentials are valid
    const login =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                // Read and validate the user details from the request body
                const userDetails = req.body;
                const result = joi.validate(userDetails, userDetailsSchema);
                if (result.error) {
                    res.status(400).send();
                } else {
                    // Try to find the user with the given credentials
                    const match = await userRepository.findOne(userDetails);
                    // Return error HTTP 404 not found if not found
                    if (match === undefined) {
                        res.status(401).send();
                    } else {
                        // Create JWT token
                        if (AUTH_SECRET === undefined) {
                            throw new Error("Missing environment variable DATABASE_HOST");
                        } else {
                            const tokenContent: AuthTokenContent = { id: match.id };
                            const token = jwt.sign(tokenContent, AUTH_SECRET);
                            res.json({ token: token }).send();
                        }
                    }
                }
            // Handle unexpected errors
            } catch(err) {
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    return {
        login
    };

}

export function getAuthController() {

    const AUTH_SECRET = process.env.AUTH_SECRET;

    if (AUTH_SECRET === undefined) {
        throw new Error("Missing environment variable AUTH_SECRET");
    }

    const repository = getUserRepository();
    const handlers = getHandlers(AUTH_SECRET, repository);
    const router = express.Router();

    // HTTP POST http://localhost:8080/auth/login/
    router.post("/login", handlers.login);

    return router;
}
