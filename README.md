This repository shows the usage of the Replica Set feature from MongoDB to serve
what we can call a *reporting replica*.

As the name says, the main purpose of this kind of replica is not to ensure
high availability, but to provide an easy way to get an real-time copy of the
production database. This replica can be queried without any performance impact
on the production evironment.

## Running this example
You will need `docker`, `docker-compose` and a local `mongo` client to get this
example working.

First, start both of the mongodb instances:
```bash
docker-compose up -d mongo mongo-replica
```

Then, log in the first instance, we will choose this one to be our *primary*
replica.
```bash
mongo localhost:10001
```

Initialize the replica set, then add the secondary instance:
```javascript
rs.initiate()
rs.add({ host: 'mongo-replica:27017', hidden: true, priority: 0 })
```

Get the worker up and running:
```bash
docker-compose up -d worker
```

You should be able to see the data being replicated from `localhost:10001` to
`localhost:10002`.

## What is missing?
- For the sake of simplicity, there is no authentication setup in this example.
This is something I will add later.
