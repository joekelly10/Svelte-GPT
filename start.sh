#!/bin/bash

# Colors
blue='\033[0;34m'
cyan='\033[0;36m'
white='\033[0;37m'
blue_bold='\033[1;34m'
cyan_bold='\033[1;36m'
white_bold='\033[1;37m'
reset='\033[0m'

# Read port values from config.js
APP_PORT=$(grep "const APP_PORT" ./src/lib/config.js | sed "s/.*APP_PORT *=* *//;s/[',]//g" | tr -d '[:space:]')
POCKETBASE_PORT=$(grep "const POCKETBASE_PORT" ./src/lib/config.js | sed "s/.*POCKETBASE_PORT *=* *//;s/[',]//g" | tr -d '[:space:]')

echo -e "\n\n"
echo -e "${white_bold} .d8888b.  888     888 8888888888 888    88888888888 8888888888       .d8888b.  8888888b. 88888888888                 ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}d88P  Y88b 888     888 888        888        888     888             d88P  Y88b 888   Y88b    888                    ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}Y88b.      888     888 888        888        888     888             888    888 888    888    888                   ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold} \"Y888b.   Y88b   d88P 8888888    888        888     8888888         888        888   d88P    888                  ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}    \"Y88b.  Y88b d88P  888        888        888     888             888  88888 8888888P\"     888                 ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}      \"888   Y88o88P   888        888        888     888             888    888 888           888                ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold}Y88b  d88P    Y888P    888        888        888     888             Y88b  d88P 888           888               ${blue_bold}d88P   d88P${reset}"
echo -e "${white_bold} \"Y8888P\"      Y8P     8888888888 88888888   888     8888888888       \"Y8888P88 888           888              ${blue_bold}d88P   d88P${reset}"
echo -e "\n\n"

# Start Pocketbase in the background
pocketbase/pocketbase serve --http="localhost:${POCKETBASE_PORT}" > pocketbase/pocketbase.log &

echo -e "  ${blue_bold}POCKETBASE${reset}\n"
echo -e "  ${blue_bold}➜ ${white_bold}Admin: ${blue}http://localhost:${blue_bold}${POCKETBASE_PORT}${blue}/_/${reset}\n"

# Store the PID of the Pocketbase process
pocketbase_pid=$!

# Start SvelteGPT
env="${1:-preview}"
npm run $env

# Kill Pocketbase after SvelteGPT exits
kill $pocketbase_pid
