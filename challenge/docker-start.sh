#!/bin/bash

# replica set for transactions to work
mongod --port 27017 --replSet rs0  &

# wait until mongo / memcached are up, increase values if running on a potato
# TODO not like this; didn't work for sql01-sql03 either
sleep 10

# Initialize the replica set
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"

# Wait for replica set to be ready
sleep 5

# set envs
export MONGODB_URI=mongodb://localhost:27017/?replicaSet=rs0
export JWT_SECRET=$(openssl rand -hex 32)
# BASE_URL should be set by the "caller" (Dockerfile)
# NODE_ENV set automatically

cd /app/backend

# initialize database
bun run init-db

# read flag password hash from file (written by init-db)
export FLAG_PASSWORD=$(cat /tmp/flag_password_hash)

rm /tmp/flag_password_hash

# start server
bun run start