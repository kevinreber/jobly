/** Users routes */

const express = require("express");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const createToken = require("../helpers/createToken");

/** middleware */
const {
    authRequired,
    ensureCorrectUser
} = require("../middleware/auth");

/** Get user schemas we need */
const jsonschema = require("jsonschema");
const {
    userNewSchema,
    userUpdateSchema
} = require('../schemas');

const router = new express.Router();

/** GET / - Return handle and name for all users.
 * res = {user: [user, ..., ...] }
 */
router.get("/", authRequired, async (req, res, next) => {
    try {
        const users = await User.getAll(req.query);
        return res.json({
            users
        });
    } catch (err) {
        return next(err);
    }
})

/** POST / - Register a new user and return token of newly registered user. 
 * res = {token: userData}
 */
router.post("/", async (req, res, next) => {
    try {
        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, userNewSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const newUser = await User.register(req.body);

        // create token for new user
        const token = createToken(newUser);
        return res.status(201).json({
            token
        });

    } catch (err) {
        return next(err);
    }
})

/** GET /[username] - Return a single user founded by it's [username].
 * res = {user: userData}
 */
router.get("/:username", authRequired, async (req, res, next) => {
    try {
        console.log(req.params.username);

        const user = await User.get(req.params.username);
        return res.json({
            user
        });
    } catch (err) {
        return next(err);
    }
})

/** PATCH /[username] - Update an existing user and return the updated user.
 * res = {user: userData}
 */
router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        if ("username" in req.body || "is_admin" in req.body) {
            throw new ExpressError("You are not allowed to change 'username' or 'is_admin' properties.", 400);
        }

        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, userUpdateSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({
            user
        });
    } catch (err) {
        return next(err);
    }
})

/** DELETE /[username] - Remove an existing user and return a message.
 * res = {message: "Company deleted"}
 */
router.delete("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        await User.remove(req.params.username);
        return res.json({
            message: "User removed"
        })
    } catch (err) {
        return next(err);
    }
})

// export routes
module.exports = router;