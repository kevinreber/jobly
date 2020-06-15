/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const {
    SECRET_KEY
} = require("../config");
const ExpressError = require("../helpers/ExpressError");

/** Middleware to use when they must provide a valid token.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */
function authRequired(req, res, next) {
    try {
        // get token
        const tokenStr = req.body._token || req.query._token;

        // verify token
        const payload = jwt.verify(tokenStr, SECRET_KEY);

        res.locals.username = payload.username;
        return next();
    } catch (err) {
        return next(new ExpressError("You must authenticate first", 401));
    }
}

/** Middleware to use when they must provide a valid token that is an admin token.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */
function adminRequired(req, res, next) {
    try {
        // get token
        const tokenStr = req.body._token;

        // verify token
        const payload = jwt.verify(tokenStr, SECRET_KEY);
        res.locals.username = payload.username;

        if (payload.is_admin) {
            return next();
        }

        // throw an error, so we catch it in our catch, below
        throw new Error();
    } catch (err) {
        return next(new ExpressError("You must be an admin to access", 401));
    }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 * Add username onto req as a convenience for view functions.
 *
 * If not, raises Unauthorized.
 *
 */
function ensureCorrectUser(req, res, next) {
    try {
        // get token
        const tokenStr = req.body._token;

        // verify token
        const payload = jwt.verify(tokenStr, SECRET_KEY);
        res.locals.username = payload.username;

        // if payload.name matches username in 'url'
        if (payload.username === req.params.username) {
            return next();
        }

        // throw an error, so we catch it in our catch, below
        throw new Error();
    } catch (err) {
        return next(new ExpressError("Unauthorized", 401));
    }
}

module.exports = {
    authRequired,
    adminRequired,
    ensureCorrectUser
};