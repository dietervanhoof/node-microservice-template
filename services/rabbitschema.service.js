const RabbitSchema = require('rabbitmq-schema');

/**
 * Rabbit Schema Service
 * @param {Object} config   the config as returned by 'cmdargs'
 * @returns {RabbitSchemaservice}
 * @constructor
 */
function RabbitSchemaservice(config) {
    this.config = config;
    return this;
}

/**
 * Creates a RabbitSchema
 * @param {Schema} requestMessageSchema Request JSON schema to validate requests against
 * @param {Schema} responseMessageSchema    Response JSON schema to validate responses against
 * @returns {*|Schema}
 */
RabbitSchemaservice.prototype.createSchema = function(requestMessageSchema, responseMessageSchema) {
    const requestQueue = this.createQueueDefinition(this.config.RABBIT_MQ_REQUEST_QUEUE, requestMessageSchema, {});
    const responseQueue = this.createQueueDefinition(this.config.RABBIT_MQ_RESPONSE_QUEUE, responseMessageSchema, {});
    const requestBinding = this.createBindingDefinition(this.config.RABBIT_MQ_REQUEST_QUEUE, requestQueue, {});
    const responseBinding = this.createBindingDefinition(this.config.RABBIT_MQ_RESPONSE_QUEUE, responseQueue, {});
    const requestExchange = this.createExchangeDefinition(this.config.RABBIT_MQ_REQUEST_EXCHANGE, this.config.RABBIT_MQ_REQUEST_TOPIC_TYPE, [requestBinding], {});
    const responseExchange = this.createExchangeDefinition(this.config.RABBIT_MQ_RESPONSE_EXCHANGE, this.config.RABBIT_MQ_RESPONSE_TOPIC_TYPE, [responseBinding], {});
    return new RabbitSchema([
        requestExchange,
        responseExchange
    ]);
};

/**
 * Creates a queue definition
 * @param {String} queueName    the queuename
 * @param {Schema} messageSchema    Message schema to validate messages against
 * @param {Object} options  additional queue options
 * @returns {{queue: *, messageSchema: *, options: *}}
 */
RabbitSchemaservice.prototype.createQueueDefinition = function(queueName, messageSchema, options) {
    return {
        queue: queueName,
        messageSchema: messageSchema,
        options: options
    }
};

/**
 * Creates an exchange definition
 * @param {String} exchangeName the exchange name
 * @param {String} type the exchange type
 * @param {Object[]} bindings   the bindings on the exchange
 * @param {Object} options additional exchange options
 * @returns {{exchange: *, type: *, bindings: *, options: *}}
 */
RabbitSchemaservice.prototype.createExchangeDefinition = function(exchangeName, type, bindings, options) {
    return {
        exchange: exchangeName,
        type: type,
        bindings: bindings,
        options: options
    }
};

/**
 * Creates a binding definition
 * @param {String} routingPattern   the routing pattern
 * @param {String} destination  the destination queue
 * @param {Object} args additional binding arguments
 * @returns {{routingPattern: *, destination: *, args: *}}
 */
RabbitSchemaservice.prototype.createBindingDefinition = function(routingPattern, destination, args) {
    return {
        routingPattern: routingPattern,
        destination: destination,
        args: args
    }
};

module.exports = RabbitSchemaservice;