import * as express from "express";
import { Repository } from "typeorm";
import { getLinkRepository } from "../repositories/link_repository";
import { Link } from "../entities/link";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import * as joi from "joi";
import { getVoteRepository } from "../repositories/vote_repository";
import { Vote } from "../entities/vote";

export const linkIdSchema = {
    id: joi.number()
};

export const linkSchema = {
    title: joi.string(),
    url: joi.string()
};

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(linkRepository: Repository<Link>, voteRepository: Repository<Vote>) {

    const getAllLinks = (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                const links = await linkRepository.find();
                res.json(links).send();
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                   .json({ error: "Internal server error"})
                   .send();
            }
        })();
    }

    const getLinkById = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } {
                    const link = await linkRepository.createQueryBuilder("link")
                                                     .leftJoinAndSelect("link.comments", "comment")
                                                     .leftJoinAndSelect("link.user", "user")
                                                     .leftJoinAndSelect("link.votes", "vote")
                                                     .where("link.id = :id", { id: linkId.id })
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

    const createLink = (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                
                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Read and validate the link from the request body
                const newLink = req.body;
                const result = joi.validate(newLink, linkSchema);

                if (result.error) {
                    res.json({ msg: `Invalid user details in body!`}).status(400).send();
                } else {

                    // Create new link
                    const linkToBeSaved = new Link();
                    linkToBeSaved.userId = (req as AuthenticatedRequest).userId;
                    linkToBeSaved.url = newLink.url;
                    linkToBeSaved.title = newLink.title;
                    const savedLink = await linkRepository.save(linkToBeSaved);
                    res.json(savedLink).send();
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

    const deleteLinkById = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find link to be deleted
                    const link = await linkRepository.findOne(linkId.id);

                    // If link not found return 404 not found
                    if (link === undefined) {
                        res.status(404)
                           .json({ error: "Not found"})
                           .send();
                    } else {

                        // If lik was found, remove it from DB
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

    const upvoteLink = (req: express.Request, res: express.Response) => {
        (async () => {

            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find previous vote by same user
                    const vote = await voteRepository.findOne({
                        where: {
                            linkId: linkId.id,
                            userId: (req as AuthenticatedRequest).userId
                        }
                    });

                    // The user has already voted
                    if (vote !== undefined && vote.isPositive === false) {

                        // If the vote was negative we remove it
                        await voteRepository.remove(vote);
                        res.status(200).json({ ok: "ok" }).send();
                    } else if (vote !== undefined && vote.isPositive === true) {

                        // if the vote was positive we cannot vote again
                        res.status(403).json({ error: "Forbidden" }).send();
                    } else {

                        // If there was no vote we create it
                        const voteToBeSaved = new Vote();
                        voteToBeSaved.isPositive = true;
                        voteToBeSaved.linkId = linkId.id;
                        voteToBeSaved.userId = (req as AuthenticatedRequest).userId;
                        await voteRepository.save(voteToBeSaved);
                        res.status(200).json({ ok: "ok" }).send();
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

    const downvoteLink = (req: express.Request, res: express.Response) => {
        (async () => {

            try {

                // The request userId property is set by the authMiddleware
                // if it is undefined it means that we forgot the authMiddleware
                if ((req as AuthenticatedRequest).userId === undefined) {
                    throw new Error("The request is not authenticated! Please ensure that authMiddleware is used");
                }

                // Validate Id in URL
                const idStr = req.params.id;
                const linkId = { id: parseInt(idStr) };
                const idValidationresult = joi.validate(linkId, linkIdSchema);
                
                if (idValidationresult.error) {
                    res.status(400).json({ error: "Bad request" }).send();
                } else {

                    // Try to find previous vote by same user
                    const vote = await voteRepository.findOne({
                        where: {
                            linkId: linkId.id,
                            userId: (req as AuthenticatedRequest).userId
                        }
                    });

                    // The user has already voted
                    if (vote !== undefined && vote.isPositive === true) {

                        // If the vote was positive we remove it
                        await voteRepository.remove(vote);
                        res.status(200).json({ ok: "ok" }).send();
                    } else if (vote !== undefined && vote.isPositive === false) {

                        // if the vote was negative we cannot vote again
                        res.status(403).json({ error: "Forbidden" }).send();
                    } else {

                        // If there was no vote we create it
                        const voteToBeSaved = new Vote();
                        voteToBeSaved.isPositive = false;
                        voteToBeSaved.linkId = linkId.id;
                        voteToBeSaved.userId = (req as AuthenticatedRequest).userId;
                        await voteRepository.save(voteToBeSaved);
                        res.status(200).json({ ok: "ok" }).send();
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

    const linkRepository = getLinkRepository();
    const voteRepository = getVoteRepository();
    const handlers = getHandlers(linkRepository, voteRepository);
    const router = express.Router();

    // Public
    router.get("/", handlers.getAllLinks);
    router.get("/:id", handlers.getLinkById);

    // Private
    router.post("/", authMiddleware, handlers.createLink);
    router.delete("/:id", authMiddleware, handlers.deleteLinkById);
    router.post("/:id/upvote", authMiddleware, handlers.upvoteLink);
    router.post("/:id/downvote", authMiddleware, handlers.downvoteLink);

    return router;
}
