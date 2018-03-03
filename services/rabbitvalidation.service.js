const Promise = require("bluebird");
const amqp = Promise.promisifyAll(require('amqplib'));
const log = require("./logger.service");

/**
 * Asserts all exchanges in the schema
 * @param {Object} channel  the amqp channel
 * @param {RabbitSchema} fullSchema the schema to validate
 */
function assertExchanges (channel, fullSchema) {
    let exchanges = fullSchema.getExchanges();

    exchanges.forEach(function (exchange) {
        let name = exchange.exchange;
        let type = exchange.type;
        let opts = exchange.options;
        channel.assertExchange(name, type, opts)
    })
}

/**
 * Asserts all queues in the schema
 * @param {Object} channel   the amqp channel
 * @param {RabbitSchema} fullSchema    the schema to validate
 */
function assertQueues (channel, fullSchema) {
    let queues = fullSchema.getQueues();
    queues.forEach(function (queue) {
        let name = queue.queue;
        let opts = queue.options;
        channel.assertQueue(name, opts)
    })
}

/**
 * Asserts all bindings in the schema
 * @param {Object} channel  the amqp channel
 * @param {RabbitSchema} fullSchema    the schema to validate
 */
function assertBindings (channel, fullSchema) {
    let bindings = fullSchema.getBindings();

    bindings.forEach(function (binding) {
        // source is always an exchange
        let srcName = binding.source.exchange;
        let destName;

        if (binding.destination.exchange) {
            // destination is an exchange
            destName = binding.destination.exchange;
            channel.bindExchange(destName, srcName, binding.routingPattern, binding.args)
        } else {
            // destination is a queue
            destName = binding.destination.queue;
            channel.bindQueue(destName, srcName, binding.routingPattern, binding.args)
        }
    })
}

/**
 * Assert all exchanges, queues and bindings in the schema
 * @param {String} broker    the broker to connect to
 * @param {RabbitSchema} schema    the schema to validate
 */
function validateRabbitSchema(broker, schema) {
    let conn =  amqp.connect(broker);
    conn.then((conn) => {
        conn.createChannel()
            .then((ch) => {
                    assertExchanges(ch, schema);
                    assertQueues(ch, schema);
                    assertBindings(ch, schema);
                }
            )});
}

module.exports = {
    validateRabbitSchema: validateRabbitSchema
};