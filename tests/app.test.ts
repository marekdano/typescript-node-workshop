import { expect } from "chai";
import request from "supertest";
import { describe, it, before, after } from "mocha";
import { createApp } from "../src/backend/config/app";
import { getHandlers } from "../src/backend/controllers/user_controllet";
import { getUserRepository } from "../src/backend/repositories/user_repository";

describe("User controller", function () {

    before((done) => {
        (async () => {
            const userRepository = getUserRepository();
            await userRepository.clear();
        })();
    });

    // This is an example of an unit tests
    it("Should be able to create an user", function (done) {
        const credentials = {
            email: "test@test.com",
            password: "mysecret"
        };
        const mockUserRepository: any = {
            save: (newUser: any) => Promise.resolve({
                id: 1,
                email: newUser.email,
                password: newUser.password
            })
        };
        const mockRequest: any = {
            body: credentials
        };
        const mockResponse: any = {
            json: (data: any) => {
                return {
                    send: () => {
                        expect(data.email).to.eq(credentials.email);
                        expect(data.password).to.eq(credentials.password);
                        expect(data.id).to.be.a("number");
                        done();
                    }
                };
            }
        };
        const handlers = getHandlers(mockUserRepository);
        handlers.createUser(mockRequest, mockResponse);
    });

    // This is an example of an integration tests
    it("HTTP POST /api/v1/users", function (done) {
        (async () => {
            const app = await createApp();
            request(app)
                .get("/api/v1/users")
                .expect(200)
                .expect(function(res) {
                    expect(res.body[0].title).to.eq("Alien");
                    expect(res.body[1].title).to.eq("Titanic");
                })
                .end(function(err, res) {
                    if (err) throw err;
                    done();
                });
        })();
    });

});