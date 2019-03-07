import * as express from "express";
import * as joi from "joi";
import { Repository } from "typeorm";
import { getLinkRepository } from "../repositories/link_repository";
import { Link } from "../entities/link";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(linkRepository: Repository<Link>) {

    const getAllLinks =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                const links = await linkRepository.find();
                res.json(links).send();
            // Handle unexpected errors
            } catch (err) {
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const getLinkById =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                const idStr = req.params.id;
                const id = parseInt(idStr);
                console.log("-------------------------->", isNaN(id));
                if (isNaN(id)) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {
                    const link = await linkRepository.createQueryBuilder("link")
                                                     .leftJoinAndSelect("link.comments", "comment")
                                                     .leftJoinAndSelect("link.user", "user")
                                                     .leftJoinAndSelect("link.votes", "vote")
                                                     .where("link.id = :id", { id: id })
                                                     .getOne();
                    if (link === undefined) {
                        res.status(404)
                           .json({ error: "Not found"})
                           .send();
                    } else {
                        res.json(link).send();
                    }
                }
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const createLink =  (req: express.Request, res: express.Response) => {
        (async () => {
            //
        })();
    }

    const deleteLinkById =  (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Read ID from URL parameter
                const idStr = req.params.id;
                const id = parseInt(idStr);

                // If ID is not a number return 400 Bad request
                if (isNaN(id)) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {
                    // Try to find link to be deleted
                    const link = await linkRepository.findOne(id);
                    // If link not found return 404 not found
                    if (link === undefined) {
                        res.status(404)
                           .json({ error: "Not found"})
                           .send();
                    // If lik was found, remove it from DB
                    } else {
                        await linkRepository.remove(link);
                        res.json({ msg: "OK" }).send();
                    }
                }
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const upvoteLink =  (req: express.Request, res: express.Response) => {
        (async () => {
            
            // The request userId property is set by the authMiddleware
            // if it is undefined it means that we forgot the authMiddleware
            if ((req as AuthenticatedRequest).userId === undefined) {
                throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
            }

        })();
    }

    const downvoteLink =  (req: express.Request, res: express.Response) => {
        (async () => {

            // The request userId property is set by the authMiddleware
            // if it is undefined it means that we forgot the authMiddleware
            if ((req as AuthenticatedRequest).userId === undefined) {
                throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
            }

        })();
    }

    return {
        getAllLinks,
        getLinkById,
        createLink,
        deleteLinkById,
        upvoteLink,
        downvoteLink
    };

}

export function getLinksController() {

    const repository = getLinkRepository();
    const handlers = getHandlers(repository);
    const router = express.Router();

    // Public
    router.get("/", handlers.getAllLinks);
    router.get("/:id", handlers.getLinkById);

    // Private
    router.post("/", authMiddleware, handlers.createLink);
    router.delete("/", authMiddleware, handlers.deleteLinkById);

    return router;
}
