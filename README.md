# node-microservice-template
Template for building node microservices using RabbitMQ built using [coworkers](https://github.com/tjmehta/coworkers).

## Usage
Clone the project and fill in all TODO tags in `main.js`.

Start the project by running
```
node main.js \
        --RABBIT_MQ_HOST=localhost \
        --RABBIT_MQ_PORT=5672 \
        --RABBIT_MQ_VHOST=/ \
        --RABBIT_MQ_REQUEST_EXCHANGE=requests-exchange \
        --RABBIT_MQ_REQUEST_QUEUE=requests-queue \
        --RABBIT_MQ_RESPONSE_EXCHANGE=responses-exchange \
        --RABBIT_MQ_RESPONSE_QUEUE=responses-queue \
        --RABBIT_MQ_REQUEST_TOPIC_TYPE=direct \
        --RABBIT_MQ_RESPONSE_TOPIC_TYPE=direct \
        --RABBIT_MQ_USER=guest \
        --RABBIT_MQ_PASSWORD=guest
```

The service will create exchanges, queues and bindings on RabbitMQ. Incoming and outgoing messages against a JSON schema.
