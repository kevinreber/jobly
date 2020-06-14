/** Users routes */

const express = require("express");

/** local dependencies */
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");

/** Get user schemas we need */
const {
    userNewSchema,
    userUpdateSchema
} = require('../schemas');

const router = new express.Router();

// export routes
module.exports = router;