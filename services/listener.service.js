const coworkers = require('coworkers');
const amqplib = require("amqplib");
const log = require("./logger.service");
const consumeOpts = {};

/**
 * AMQP Listening Service
 * @param {Object} config   the config as returned by 'cmdargs'
 * @param {RabbitSchema} topologySchema the RabbiqMQ topology schema to be used in this service
 * @returns {Listener}
 * @constructor
 */
function Listener(config, topologySchema) {
    this.topologySchema = topologySchema;
    this.config = config;
    return this;
}

/**
 * Initializes the listener before use
 * @param {function[]} middleware   the processing that needs to be done for a message
 * @param {function} error  the function to execute on error
 */
Listener.prototype.initialize = function(before, processing, after, error) {
    this.app = coworkers(this.topologySchema);
    const that = this;

    // Elapsed time trace
    this.app.use(function * (next) {
        // save consumer start time
        const startTime = Date.now();
        // move on to next middleware
        yield next;
        // all middlewares have finished
        const elapsed = Date.now() - startTime;
        log.debug(`coworkers-trace:${elapsed} ms`);
    });

    // JSON parsing
    this.app.use(function * (next) {
        this.message.content = JSON.parse(this.message.content);
        yield next
    });

    // Pass all before functions to the consumer
    before.forEach((b) => {
        this.app.use(b);
    });

    // Pass the processing functions to the consumer
    processing.forEach((p) => {
        this.app.use(p);
    });

    // Pass the after functions to the consumer
    after.forEach((a) => {
        this.app.use(a);
    });

    this.app.prefetch(1, false);

    this.app.queue(this.config.RABBIT_MQ_REQUEST_QUEUE, consumeOpts, function * () {
        this.ack = true;
        log.debug("I finished with this message");
    });

    this.app.on('error', error);
};

/**
 * Start listening
 */
Listener.prototype.listen = function() {
    this.app.connect(this.config.broker);
};

module.exports = Listener;