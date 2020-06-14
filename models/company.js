/** Companies Model */

/** connect to DB */
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {

    /** get all companies */
    static async getAll() {
        const results = await db.query(
            `SELECT handle, name 
                FROM companies
                ORDER BY name`);

        return results.rows;
    }

    /** get a company by their 'handle' */
    static async get(handle) {
        const result = await db.query(
            `SELECT handle, name, num_employees, description, logo_url 
                FROM companies
                WHERE handle=$1`,
            [handle]);

        const company = result.rows[0];

        // verify company exists
        if (!company) {
            throw new ExpressError(`No such company '${handle}'`, 404);
        }

        return company;
    }

    /** create a new company from 'data' passed 
     *  returns new company
     */
    static async create(data) {
        /** Check if company already exists */
        const checkDuplicate = await db.query(
            `SELECT handle
                FROM companies
                WHERE handle = $1`,
            [data.handle]);

        /** Return error if company already exists */
        if (checkDuplicate.rows[0]) {
            throw new ExpressError(`There already exists a company with the handle ${data.handle}`, 404);
        }

        const result = await db.query(
            `INSERT INTO companies
                    (handle, name, num_employees, description, logo_url)
                VALUES($1 ,$2 ,$3 ,$4 ,$5)
                RETURNING handle, name, num_employees, description, logo_url`,
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
            throw new ExpressError(`There exists no company '${handle}`, 404);
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