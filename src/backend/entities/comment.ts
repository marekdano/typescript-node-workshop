import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import * as joi from "joi";
import { Link } from "./link";
import { User } from "./user";

export const commentIdSchema = {
    id: joi.number
};

export const commentUpdateSchema = {
    content: joi.string
}

export const newCommentSchema = {
    linkId: joi.number,
    content: joi.string
};

@Entity()
export class Comment {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column()
    public linkId!: number;

    @Column()
    public content!: string;

    // A link can have many comments but a comment only belongs to one link
    @ManyToOne(type => Link, link => link.comments)
    public link!: Link;

    // An user can have many comments but a comment only belongs to an user
    @ManyToOne(type => User, user => user.comments)
    public user!: User;

}