import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import * as joi from "joi";
import { Vote } from "./vote";
import { Link } from "./link";
import { Comment } from "./comment";

export const UserIdSchema = {
    id: joi.number()
};

export const userDetailsSchema = {
    email: joi.string().email(),
    password: joi.string()
};

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public email!: string;

    @Column()
    public password!: string;

    // An user can have many votes but a link only belongs to an user
    @OneToMany(type => Link, link => link.user)
    public links!: Link[];

    // An user can have many votes but a vote only belongs to an user
    @OneToMany(type => Vote, vote => vote.user)
    public votes!: Vote[];

    // An user can have many votes but a vote only belongs to an user
    @OneToMany(type => Comment, comment => comment.user)
    public comments!: Comment[];

}
