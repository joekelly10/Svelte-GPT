#!/bin/bash

# Start Pocketbase in the background
pocketbase/pocketbase serve --http="127.0.0.1:1336" > pocketbase/pocketbase.log &

# Store the PID of the Pocketbase process
pocketbase_pid=$!

# Start SvelteGPT
npm run dev

# Kill Pocketbase after SvelteGPT exits
kill $pocketbase_pid
