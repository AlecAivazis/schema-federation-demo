# Schema Federation Demo

This is the project that accompanies my series on schema federation. For more information on schema federation or
the reason for this project, read [this post]().

Each post after the first has a corresponding branch in this repo that acts as the starting point for that guide. 

## Running the services

Each service is defined by a single file that contains all of required information to have a functioning graphql API. 
To start, install the dependencies by running `npm i` in this directory and then run each node script in a separate terminal:

```bash
node ./auctionService.js
```
```bash
node ./photoService.js
```

These servers listen on ports 3000 and 3001 respectively.

## Running the gateway

The correct method for running the gateway depends on the details of the example. For the first guide, you can 
start by downloading the appropriate binary from the latest release of the nautilus gateway and then pointing it
at the two services that you just started:

```bash
gateway --services http://localhost:3000,http://localhost:3001
```
