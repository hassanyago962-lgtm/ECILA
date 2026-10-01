#!/bin/sh
# Start the background worker script in the background (&)
npm run worker &

# Start the main Next.js web application server
npm run start
