const chalk = require('chalk');
const util = require("util");
require( "console-stamp" )( console, { pattern : "dd/mm/yyyy HH:MM:ss.l" } );

const debug = (message) => {
	console.log(message);
};

const error = (message) => {
    console.error(chalk.red(message));
};

const info = (message) => {
    console.info(chalk.white(message));
};

const success = (message) => {
    console.info(chalk.green(message));
};

const warn = (message) => {
    console.warn(chalk.yellow(message));
};

module.exports = {
    debug,
    error,
    info,
    success,
    warn
};
