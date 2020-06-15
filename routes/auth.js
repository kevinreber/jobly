/** Routes for authentication. */

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/createToken");

router.post("/login", (req, res, next) => {
    try {
        /** is request passed in does not authenticate
         *  ExpressError() will be thrown from User */
        const user = User.authenticate(req.body);
        const token = createToken(user);
        return res.json({
            token
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;