#!/bin/bash

# Resource Management Commands for Experiment Tracker
API_URL="https://experiment-tracker-production.up.railway.app/api/resources"

echo "🖥️ Resource Management Commands"
echo "==============================="
echo

# List all resources
echo "📋 LIST ALL RESOURCES:"
echo "curl $API_URL"
echo

# Add resource
echo "➕ ADD RESOURCE:"
echo "curl -X POST $API_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"resourceId\": \"gpu-cluster-4\","
echo "    \"name\": \"GPU Cluster Delta\","
echo "    \"type\": \"Compute\","
echo "    \"totalUnits\": \"8x RTX 5090\","
echo "    \"status\": \"active\""
echo "  }'"
echo

# Delete resource
echo "🗑️ DELETE RESOURCE (replace RESOURCE_ID with actual database ID):"
echo "curl -X DELETE $API_URL/RESOURCE_ID"
echo

# Update resource
echo "✏️ UPDATE RESOURCE (replace RESOURCE_ID with actual database ID):"
echo "curl -X PUT $API_URL/RESOURCE_ID \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"name\": \"Updated Name\","
echo "    \"status\": \"maintenance\""
echo "  }'"
echo

echo "🔍 To get resource IDs for deletion/update, first run:"
echo "curl $API_URL | python3 -c \"import json,sys; [print(f'{r[\"name\"]} -> ID: {r[\"id\"]}') for r in json.load(sys.stdin)['resources']]\""

