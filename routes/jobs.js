/** Routes for jobs */

const express = require("express");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const jsonschema = require("jsonschema");

/** middleware */
const {
    authRequired,
    adminRequired
} = require("../middleware/auth");

/** Get job schemas we need */
const {
    jobNewSchema,
    jobUpdateSchema
} = require('../schemas');

const router = new express.Router();

/** GET / - Return handle and name for all jobs.
 * 
 * Allows for the following request parameters:
 *  - search
 *  - min_salary
 *  - min_equity
 * 
 * res = {jobs: [job, ..., ...] }
 */
router.get("/", authRequired, async (req, res, next) => {
    try {
        const jobs = await Job.getAll(req.query);
        return res.json({
            jobs
        });
    } catch (err) {
        return next(err);
    }
})

/** POST / - Create a new job and return the newly created job. 
 * res = {job: jobData}
 */
router.post("/", adminRequired, async (req, res, next) => {
    try {
        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, jobNewSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({
            job
        });

    } catch (err) {
        return next(err);
    }
})

/** GET /[id] - Return a single job founded by it's [id].
 * res = {job: jobData}
 */
router.get("/:id", authRequired, async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({
            job
        });
    } catch (err) {
        return next(err);
    }
})

/** PATCH /[id] - Update an existing job and return the updated job.
 * res = {job: jobData}
 */
router.patch("/:id", adminRequired, async (req, res, next) => {
    try {
        if ("id" in req.body) {
            throw new ExpressError("You are not allowed to change the job id.", 404);
        }

        /** Validate JSON schema */
        const validate = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validate.valid) {
            throw new ExpressError(validate.errors.map(e => e.stack), 400);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({
            job
        });
    } catch (err) {
        return next(err);
    }
})

/** DELETE /[id] - Remove an existing job and return a message.
 * res = {message: "Company deleted"}
 */
router.delete("/:id", adminRequired, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({
            message: "Job removed"
        })
    } catch (err) {
        return next(err);
    }
})

// export routes
module.exports = router;