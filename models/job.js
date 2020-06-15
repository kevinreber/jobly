/** Jobs model */

/** connect to DB */
const db = require("../db");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {

    /** Get all jobs (can filter on terms in data). */
    static async getAll(data) {
        let baseQuery = "SELECT id, title, company_handle FROM jobs";
        let whereExpressions = [];
        let queryValues = [];

        // For each possible search term, add to whereExpressions and
        // queryValues so we can generate the right SQL

        if (data.min_salary) {
            queryValues.push(+data.min_salary);
            whereExpressions.push(`salary >= $${queryValues.length}`);
        }

        if (data.max_equity) {
            queryValues.push(+data.max_equity);
            whereExpressions.push(`equity >= $${queryValues.length}`);
        }

        if (data.search) {
            queryValues.push(`%${data.search}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }

        // Finalize query and return results
        let finalQuery = baseQuery + whereExpressions.join(" AND ");
        const results = await db.query(finalQuery, queryValues);

        return results.rows;
    }

    /** get a job by their 'id' */
    static async get(id) {
        /** Check if job exists first */
        const jobResult = await db.query(
            `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = $1`,
            [id]);

        const job = jobResult.rows[0];

        if (!job) {
            throw new ExpressError(`There is no job with the id '${id}'`, 404);
        }

        /** Get company of job */
        const companyResult = await db.query(
            `SELECT name, num_employees, description, logo_url
                FROM companies
                WHERE handle = $1`, [job.company_handle]);

        job.company = companyResult.rows[0];

        return job;
    }

    /** create a new job from 'data' passed 
     *  returns new job
     */
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs(title, salary, equity, company_handle)
                VALUES($1, $2, $3, $4)
                RETURNING title, salary, equity, company_handle`,
            [data.title, data.salary, data.equity, data.company_handle]);

        return result.rows[0];
    }

    /** update an existing job using 'data' */
    static async update(id, data) {
        let {
            query,
            values
        } = sqlForPartialUpdate("jobs", data, "id", id);

        const result = await db.query(query, values);
        const job = result.rows[0];

        if (!job) {
            throw new ExpressError(`
                There exists no job '${id}`, 404);
        }
        return job;
    }

    /** remove job from DB */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs
                WHERE id = $1
                RETURNING id`,
            [id]);

        if (result.rows[0].length === 0) {
            throw new ExpressError(`There exists no job with the id '${id}'`, 404);
        }
    }
}

// export job model
module.exports = Job;