import * as express from "express";
import * as joi from "joi";
import { Repository } from "typeorm";
import { User, userDetailsSchema, UserIdSchema } from "../entities/user";
import { getUserRepository } from "../repositories/user_repository";
import { authMiddleware } from "../config/auth";

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(userRepository: Repository<User>) {

    // Creates a new user
    const createUser =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // Read and validate the user from the request body
                const newUser = req.body;
                const result = joi.validate(newUser, userDetailsSchema);

                if (result.error) {
                    res.json({ msg: `Invalid user details in body!`}).status(400).send();
                } else {
                    // Save the user into the database
                    await userRepository.save(newUser);
                    res.json({ ok: "ok" }).send();
                }

            } catch(err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    };

    // Get one user by its ID
    const getUserById =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // Get the user ID from the request URL and validate it
                const idStr = req.params.id;
                const userId = { id: parseInt(idStr) };
                const result = joi.validate(userId, UserIdSchema);

                if (result.error) {
                    res.status(400)
                    .json({ msg: `Invalid parameter id '${userId.id}' in URL` })
                    .send();
                } else {
                    // Try to find the user by the given ID
                    const user = await userRepository.findOne(userId);
                    // Return error HTTP 404 not found if not found
                    if (user === undefined) {
                        res.status(404)
                        .json({ msg: `User with id '${userId.id}' not found!` })
                        .send();
                    } else {
                        // Return the user
                        res.json(user).send();
                    }
                }

            } catch(err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    };

    return {
        createUser,
        getUserById
    };

}

export function getUserController() {

    const repository = getUserRepository();
    const handlers = getHandlers(repository);
    const router = express.Router();

    // Public
    router.post("/", handlers.createUser);

    // Private
    router.get("/:id", authMiddleware, handlers.getUserById);

    return router;
}
