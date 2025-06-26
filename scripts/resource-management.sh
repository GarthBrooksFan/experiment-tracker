#!/bin/bash

# Resource Management Script for Experiment Tracker
# Usage: ./scripts/resource-management.sh

API_URL="https://experiment-tracker-production.up.railway.app/api/resources"

echo "🖥️  Resource Management Commands"
echo "================================"
echo

# Function to list all resources
list_resources() {
    echo "📋 Listing all resources..."
    curl -s "$API_URL" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    resources = data.get('resources', [])
    if not resources:
        print('No resources found.')
    else:
        print(f'Found {len(resources)} resources:')
        print()
        for resource in resources:
            status_icon = '🟢' if resource['status'] == 'active' else '🟡' if resource['status'] == 'idle' else '🔴'
            print(f'{status_icon} {resource[\"name\"]} (ID: {resource[\"id\"]})')
            print(f'   Resource ID: {resource[\"resourceId\"]} | Type: {resource[\"type\"]}')
            print(f'   Units: {resource[\"totalUnits\"]} | Status: {resource[\"status\"]}')
            print()
except Exception as e:
    print('Error parsing response:', e)
"
}

# Function to delete a resource
delete_resource() {
    if [ -z "$1" ]; then
        echo "Usage: delete_resource <resource_database_id>"
        echo "First run list_resources to get the database ID"
        return 1
    fi
    
    resource_id="$1"
    echo "🗑️  Deleting resource with ID: $resource_id"
    
    response=$(curl -s -X DELETE "$API_URL/$resource_id")
    echo "Response: $response"
}

# Function to add a resource
add_resource() {
    if [ $# -lt 4 ]; then
        echo "Usage: add_resource <resourceId> <name> <type> <totalUnits> [status]"
        echo "Example: add_resource 'gpu-cluster-4' 'GPU Cluster Delta' 'Compute' '8x RTX 5090' 'active'"
        return 1
    fi
    
    resourceId="$1"
    name="$2"
    type="$3"
    totalUnits="$4"
    status="${5:-active}"
    
    echo "➕ Adding resource: $name"
    
    curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"resourceId\": \"$resourceId\",
            \"name\": \"$name\",
            \"type\": \"$type\",
            \"totalUnits\": \"$totalUnits\",
            \"status\": \"$status\"
        }"
    echo
}

# Main script logic
case "$1" in
    "list")
        list_resources
        ;;
    "delete")
        delete_resource "$2"
        ;;
    "add")
        add_resource "$2" "$3" "$4" "$5" "$6"
        ;;
    *)
        echo "Usage: $0 {list|delete|add}"
        echo
        echo "Commands:"
        echo "  list                              - List all resources"
        echo "  delete <id>                       - Delete resource by database ID"
        echo "  add <resourceId> <name> <type> <units> [status] - Add new resource"
        echo
        echo "Examples:"
        echo "  $0 list"
        echo "  $0 delete cluid1234567890"
        echo "  $0 add 'gpu-cluster-4' 'GPU Cluster Delta' 'Compute' '8x RTX 5090' 'active'"
        echo
        echo "Raw API commands:"
        echo "  List: curl $API_URL"
        echo "  Delete: curl -X DELETE $API_URL/<resource_id>"
        echo "  Add: curl -X POST $API_URL -H 'Content-Type: application/json' -d '{...}'"
        ;;
esac 