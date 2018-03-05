const log = require("./services/logger.service");
const options = require("./utils/cmdargs").parseArguments();
const RabbitSchemaService = require("./services/rabbitschema.service");
const Listener = require("./services/listener.service");
const schemaService = new RabbitSchemaService(options);
const rabbitvalidationservice = require("./services/rabbitvalidation.service");

// TODO: Add processing class

// Defines the JSON schema to validate requests
const requestMessageSchema = {
    type: 'object',
    properties: {
        correlation_id: {
            type: 'string'
        },
        // TODO: add request properties
    },
    required: [
        "correlation_id"
        // TODO: add required request properties
    ]
};

// Defines the JSON schema to validate responses
const responseMessageSchema = {
    type: 'object',
    properties: {
        correlation_id: {
            type: 'string'
        },
        outcome: {
            type: 'string'
        },
        message: {
            type: 'string'
        }
        // TODO: add request properties
    },
    required: [
        "correlation_id",
        "outcome"
        // TODO: add required request properties
    ]
};

const topologySchema = schemaService.createSchema(requestMessageSchema, responseMessageSchema);
rabbitvalidationservice.validateRabbitSchema(options.broker, topologySchema);
const listener = new Listener(options, topologySchema);

// Initialize the listener by passing the functions to execute
listener.initialize(
    // Before processing
    [
        // Request validation function
        function *(next) {
            log.debug("Validating request message");
            topologySchema.validateMessage(options.RABBIT_MQ_REQUEST_EXCHANGE, options.RABBIT_MQ_REQUEST_EXCHANGE, this.message.content);
            yield next;
        }
    ],
    // Processing
    [
        function *(next) {
            const subtitleCovertService = new SubtitleConvertService(this.message.content.source_file, this.message.content.destination_file);
            // TODO: Do the processing
            // Put the response in the state object
            this.state.response = {
                // TODO: Generate a success response
            };
            yield next;
        }
    ],
    // After processing
    [
        function *(next) {
            log.debug("Validating response message");
            topologySchema.validateMessage(options.RABBIT_MQ_RESPONSE_EXCHANGE, options.RABBIT_MQ_RESPONSE_EXCHANGE, this.state.response);
            yield next;
        },
        // Success publish function
        function * (next) {
            this.publish(options.RABBIT_MQ_RESPONSE_QUEUE, options.RABBIT_MQ_RESPONSE_QUEUE, this.state.response, {});
            yield next;
        }
    ],
    // Error function
    function (err, context) {
        context.state.response = {
            // TODO: Generate a failed response
        };
        log.error(`${context.queueName}` + " consumer error: " + err.message);

        let channel = context.consumerChannel; // amqplib promise api: http://www.squaremobius.net/amqp.node/channel_api.html#channel
        let message = context.message;
        // nack the message
        channel.nack(message, false, false);
        context.publish(options.RABBIT_MQ_RESPONSE_QUEUE, options.RABBIT_MQ_RESPONSE_QUEUE, context.state.response, {});
    });

// Start listening
listener.listen();