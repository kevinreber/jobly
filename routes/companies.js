/** Routes about companies */

const express = require("express");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const Company = require("../models/company");

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
router.get("/", async (req, res, next) => {
    try {
        const companies = await Company.getAll();
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
router.post("/", async (req, res, next) => {
    try {
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
router.get("/:handle", async (req, res, next) => {
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
router.patch("/:handle", async (req, res, next) => {
    try {
        /** user is not allowed to change handle */
        if ('handle' in req.body) {
            throw new ExpressError('You are not allowed to change the handle.', 404);
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
router.delete("/:handle", async (req, res, next) => {
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