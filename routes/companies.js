/** Routes about companies */

const express = require("express");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const jsonschema = require("jsonschema");

/** middleware */
const {
    authRequired,
    adminRequired
} = require("../middleware/auth");

/** Get company schemas we need */
const {
    companyNewSchema,
    companyUpdateSchema
} = require("../schemas");

const router = new express.Router();

/** GET / - Return handle and name for all companies.
 * 
 * Allows for the following request parameters:
 *  - search
 *  - min_employees
 *  - max_employees
 * 
 * res = {company: [companyData, ..., ...] }
 */
router.get("/", authRequired, async (req, res, next) => {
    try {
        const companies = await Company.getAll(req.query);
        return res.json({
            companies
        });
    } catch (err) {
        return next(err);
    }
});

/** POST / - Create a new company and return the newly created company. 
 * res = {company: companyData}
 */
router.post("/", adminRequired, async (req, res, next) => {
    try {
        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, companyNewSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const company = await Company.create(req.body);
        return res.status(201).json({
            company
        });

    } catch (err) {
        return next(err);
    }
})


/** GET /[handle] - Return a single company founded by it's [handle].
 * res = {company: companyData}
 */
router.get("/:handle", authRequired, async (req, res, next) => {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({
            company
        });

    } catch (err) {
        return next(err)
    }
})


/** PATCH /[handle] - Update an existing company and return the updated company.
 * res = {company: companyData}
 */
router.patch("/:handle", adminRequired, async (req, res, next) => {
    try {
        /** user is not allowed to change handle */
        if ('handle' in req.body) {
            throw new ExpressError('You are not allowed to change the handle.', 404);
        }

        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, companyUpdateSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const company = await Company.update(req.params.handle, req.body);
        return res.json({
            company
        });
    } catch (err) {
        return next(err);
    }
})

/** DELETE /[handle] - Remove an existing company and return a message.
 * res = {message: "Company deleted"}
 */
router.delete("/:handle", adminRequired, async (req, res, next) => {
    try {
        await Company.remove(req.params.handle);
        return res.json({
            message: "Company deleted"
        });
    } catch (err) {
        return next(err);
    }
})

// export routes
module.exports = router;