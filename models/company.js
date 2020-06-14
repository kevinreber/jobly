/** Companies Model */

/** connect to DB */
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {

    /** get all companies */
    static async getAll(data) {
        let baseQuery = `SELECT handle, name FROM companies`;
        let whereExpressions = [];
        let queryValues = [];

        /** Verify min_employees is less than max_employees */
        if (+data.min_employees >= +data.max_employees) {
            throw new ExpressError("Min employees must be less than max employees", 400);
        }

        // For each possible search term, add to whereExpressions and
        // queryValues so we can generate the right SQL

        if (data.min_employees) {
            queryValues.push(+data.min_employees);
            whereExpressions.push(`num_employees >= $${queryValues.length}`);
        }

        if (data.max_employees) {
            queryValues.push(+data.max_employees);
            whereExpressions.push(`num_employees <= $${queryValues.length}`);
        }

        if (data.search) {
            queryValues.push(`%${data.search}%`);
            whereExpressions.push(`name ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }

        // Finalize query and return results
        let finalQuery = baseQuery + whereExpressions.join(" AND ") + " ORDER BY name";
        const results = await db.query(finalQuery, queryValues);

        return results.rows;
    }

    /** get a company by their 'handle' */
    static async get(handle) {
        const companyResult = await db.query(
            `
            SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1 `,
            [handle]);

        const company = companyResult.rows[0];

        // verify company exists
        if (!company) {
            throw new ExpressError(`
            No such company '${handle}'
            `, 404);
        }

        // get job list of company
        const jobResults = await db.query(
            `SELECT id, title, salary, equity
                FROM jobs
                WHERE company_handle = $1`,
            [handle]
        );

        company.jobs = jobResults.rows;

        return company;
    }

    /** create a new company from 'data' passed 
     *  returns new company
     */
    static async create(data) {
        /** Check if company already exists */
        const checkDuplicate = await db.query(
            `
            SELECT handle FROM companies WHERE handle = $1 `,
            [data.handle]);

        /** Return error if company already exists */
        if (checkDuplicate.rows[0]) {
            throw new ExpressError(`
            There already exists a company with the handle $ {
                data.handle
            }
            `, 404);
        }

        const result = await db.query(
            `
            INSERT INTO companies(handle, name, num_employees, description, logo_url) 
                VALUES($1, $2, $3, $4, $5) 
                RETURNING handle, name, num_employees, description, logo_url `,
            [
                data.handle,
                data.name,
                data.num_employees,
                data.description,
                data.logo_url
            ]);

        return result.rows[0];
    }

    /** update an existing company using 'data' */
    static async update(handle, data) {
        let {
            query,
            values
        } = sqlForPartialUpdate("companies", data, "handle", handle);

        const result = await db.query(query, values);
        const company = result.rows[0];

        if (!company) {
            throw new ExpressError(`
            There exists no company '${handle}`, 404);
        }
        return company;
    }

    static async remove(handle) {
        const result = await db.query(
            `DELETE FROM companies
                WHERE handle = $1
                RETURNING handle`,
            [handle]);

        if (result.rows[0].length === 0) {
            throw new ExpressError(`There exists no company with the handle '${handle}'`, 404);
        }
    }
}

module.exports = Company;