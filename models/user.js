/** User model */

/** connect to DB */
const db = require("../db");

/** bcrypt */
const bcrypt = require("bcrypt");
const BCRYPT_WORK_FACTOR = 12;

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class User {

    /** authenticate user log in */
    static async authenticate(data) {
        /** get user from DB */
        const result = await db.query(
            `SELECT username, 
                    password, 
                    first_name, 
                    last_name, 
                    email, 
                    photo_url, 
                    is_admin
                FROM users
                WHERE username = $1`,
            [data.username]);

        const user = result.rows[0];

        if (user) {
            // compare hashed password to a new hash from password
            if (await bcrypt.compare(data.password, user.password)) {
                return user;
            }
        }

        throw new ExpressError('Invalid login information', 400);
    }


    /** create a new user from 'data' passed 
     *  returns new user
     */
    static async register(data) {
        /** Check if user already exists first */
        const checkIfUserExists = await db.query(
            `SELECT username
                FROM users
                WHERE username = $1`,
            [data.username]);

        if (checkIfUserExists.rows[0]) {
            throw new ExpressError(`Username already exists: ${data.username}`, 400);
        }

        // hash password
        const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

        const newUser = await db.query(
            `INSERT INTO users(username, password, first_name, last_name, email, photo_url)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING username, first_name, last_name, email, photo_url`,
            [
                data.username,
                hashedPassword,
                data.first_name,
                data.last_name,
                data.email,
                data.photo_url
            ]);

        return newUser.rows[0];
    }

    /** Get all users */
    static async getAll() {
        const results = await db.query(
            `SELECT username, first_name, last_name, email
                FROM users`);

        return results.rows;
    }

    /** get a user by their 'username' */
    static async get(username) {
        const results = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
                FROM users
                WHERE username=$1`,
            [username]);

        const user = results.rows[0];

        if (!user) {
            throw new ExpressError(`Username does not exist: ${username}`, 404)
        }

        return user;
    }

    /** update an existing user using 'data' */
    static async update(username, data) {
        /** hash password if attempting to change password */
        if (data.password) {
            data.password = bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        let {
            query,
            values
        } = sqlForPartialUpdate("users", data, "username", username);

        const result = await db.query(query, values);
        const user = result.rows[0];

        if (!user) {
            throw new ExpressError(`Username does not exist: ${username}`, 404);
        }

        // Don't return 'password' and 'is_admin'
        delete user.password;
        delete user.is_admin;

        return user;
    }

    /** remove user from DB */
    static async remove(username) {
        const result = await db.query(
            `DELETE FROM users
                WHERE username = $1
                RETURNING username`,
            [username]);

        if (result.rows[0].length === 0) {
            throw new ExpressError(`Username does not exist: ${username}`, 404);
        }
    }
}

// export User model
module.exports = User;