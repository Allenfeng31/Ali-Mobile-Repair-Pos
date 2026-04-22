#!/bin/bash

URL="mmjyjciyhcsjpnbtovag.supabase.co"

echo "--- Route Trace Audit ---"
echo "Target: $URL"

echo -e "\n1. Resolving IP..."
IP=$(dig +short $URL | head -n1)
if [ -z "$IP" ]; then
    IP=$(host $URL | awk '/has address/ { print $4 }' | head -n1)
fi
echo "Resolved IP: $IP"

echo -e "\n2. Pinging $IP..."
ping -c 5 $IP

echo -e "\n3. Checking Geolocation (via ip-api.com)..."
curl -s "http://ip-api.com/json/$IP?fields=status,message,country,city,lat,lon,isp,org,as,query" | python3 -m json.tool

echo -e "\n4. Local Hop (Optional Tracepath)..."
# tracepath -m 15 $URL 2>/dev/null || traceroute -m 15 $URL
traceroute -q 1 -m 15 $URL
