#!/bin/bash
export PYTHONUNBUFFERED=1
scraper/scraper_venv/bin/python3 scraper/main.py > scraper/execution_debug.log 2>&1
