#!/bin/bash

# Colors
yellow='\033[0;33m'
blue='\033[0;34m'
cyan='\033[0;36m'
white='\033[0;37m'
yellow_bold='\033[1;33m'
blue_bold='\033[1;34m'
cyan_bold='\033[1;36m'
white_bold='\033[1;37m'
reset='\033[0m'

# Start Pocketbase in the background
pocketbase/pocketbase serve --http="127.0.0.1:4321" > pocketbase/pocketbase.log &

echo -e "\n\n"
echo -e "  ${blue_bold}POCKETBASE${reset}\n"
echo -e "  ${blue_bold}➜ ${white_bold}Local: ${cyan}http://localhost:${cyan_bold}4321${cyan}/${reset}"
echo -e "  ${blue_bold}➜ ${white_bold}Admin: ${yellow}http://localhost:${yellow_bold}4321${yellow}/_/${reset}"
echo -e "\n"

# Store the PID of the Pocketbase process
pocketbase_pid=$!

# Start SvelteGPT
env="${1:-preview}"
npm run $env

# Kill Pocketbase after SvelteGPT exits
kill $pocketbase_pid
