#!/bin/bash
cd /Users/allen/Documents/GitHub/Ali-Mobile-Repair-Pos
scraper/scraper_venv/bin/python3 scripts/safe_auto_map.py > scripts/auto_map_output.txt 2>&1
echo "DONE: exit code $?" >> scripts/auto_map_output.txt
