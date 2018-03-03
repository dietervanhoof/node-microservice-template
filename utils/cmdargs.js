const util = require("util");
/**
 * All arguments that are required for startup
 * @type {[*]}
 */
const required_arguments = [
    "RABBIT_MQ_HOST",
    "RABBIT_MQ_PORT",
    "RABBIT_MQ_VHOST",
    "RABBIT_MQ_RESPONSE_EXCHANGE",
    "RABBIT_MQ_RESPONSE_QUEUE",
    "RABBIT_MQ_REQUEST_EXCHANGE",
    "RABBIT_MQ_REQUEST_QUEUE",
    "RABBIT_MQ_REQUEST_TOPIC_TYPE",
    "RABBIT_MQ_RESPONSE_TOPIC_TYPE",
    "RABBIT_MQ_USER",
    "RABBIT_MQ_PASSWORD"
];

/**
 * Parses all arguments passed with this process and generates a broker argument
 * @returns {argv}
 */
const parseArguments = () => {
    const argv = require('minimist')(process.argv.slice(2));
    required_arguments.forEach((argument) => {
        if (!argv[argument]) throw ('Argument ' + argument + ' was missing but is required.');
    });

    // Derived arguments
    argv.broker = util.format('amqp://%s:%s@%s:%d/%s',
        argv.RABBIT_MQ_USER,
        argv.RABBIT_MQ_PASSWORD,
        argv.RABBIT_MQ_HOST,
        argv.RABBIT_MQ_PORT,
        argv.RABBIT_MQ_VHOST);
    return argv;
};

module.exports = {
    parseArguments: parseArguments
};
