#!/bin/bash

# Comprehensive Resource Management Script for Experiment Tracker
# Usage: ./scripts/manage-resources.sh

API_URL="https://experiment-tracker-production.up.railway.app/api/resources"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🖥️  Resource Management for Experiment Tracker"
echo "================================================"
echo

# Function to list all resources
list_resources() {
    echo "${BLUE}📋 Current Resources:${NC}"
    echo
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
        for i, resource in enumerate(resources, 1):
            status_icon = '🟢' if resource['status'] == 'active' else '🟡' if resource['status'] == 'idle' else '🔴'
            print(f'{i}. {status_icon} {resource[\"name\"]} (ID: {resource[\"id\"]})')
            print(f'   Type: {resource[\"type\"]} | Units: {resource[\"totalUnits\"]} | Status: {resource[\"status\"]}')
            print(f'   Resource ID: {resource[\"resourceId\"]}')
            print()
except:
    print('Error parsing response')
"
    echo
}

# Function to add a resource
add_resource() {
    echo "${GREEN}➕ Add New Resource${NC}"
    echo
    
    read -p "Resource ID (unique identifier): " resourceId
    read -p "Display Name: " name
    read -p "Type (Compute/Storage/Physical Hardware): " type
    read -p "Total Units (e.g., '8x A100', '50TB'): " totalUnits
    read -p "Status (active/idle/maintenance) [default: active]: " status
    
    # Default status to active if empty
    status=${status:-active}
    
    echo
    echo "Adding resource: $name..."
    
    json_payload=$(cat <<EOF
{
    "resourceId": "$resourceId",
    "name": "$name",
    "type": "$type",
    "totalUnits": "$totalUnits",
    "status": "$status"
}
EOF
)
    
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    if [[ $? -eq 0 ]] && [[ $response != *"error"* ]]; then
        echo "${GREEN}✅ Successfully added: $name${NC}"
    else
        echo "${RED}❌ Failed to add resource${NC}"
        echo "Response: $response"
    fi
    echo
}

# Function to delete a resource
delete_resource() {
    echo "${RED}🗑️  Delete Resource${NC}"
    echo "${YELLOW}⚠️  Warning: This will permanently delete the resource!${NC}"
    echo
    
    # First list resources for reference
    list_resources
    
    read -p "Enter the Resource ID (database ID) to delete: " resourceDbId
    read -p "Are you sure you want to delete this resource? (yes/no): " confirm
    
    if [[ $confirm != "yes" ]]; then
        echo "Deletion cancelled."
        return
    fi
    
    echo
    echo "Deleting resource with ID: $resourceDbId..."
    
    response=$(curl -s -X DELETE "$API_URL/$resourceDbId")
    
    if [[ $response == *"deleted successfully"* ]]; then
        echo "${GREEN}✅ Resource deleted successfully${NC}"
        echo "$response" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    details = data.get('details', {})
    print(f'Deleted: {details.get(\"deletedResource\", \"Unknown\")}')
    if details.get('totalExperimentsUsingResource', 0) > 0:
        print(f'Note: {details[\"totalExperimentsUsingResource\"]} experiments previously used this resource')
except:
    pass
"
    elif [[ $response == *"active experiments"* ]]; then
        echo "${RED}❌ Cannot delete resource - it has active experiments${NC}"
        echo "$response" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    details = data.get('details', {})
    print(f'Active experiments: {details.get(\"activeExperimentCount\", \"Unknown\")}')
    print(details.get('message', ''))
except:
    pass
"
    elif [[ $response == *"not found"* ]]; then
        echo "${RED}❌ Resource not found${NC}"
    else
        echo "${RED}❌ Failed to delete resource${NC}"
        echo "Response: $response"
    fi
    echo
}

# Function to update a resource
update_resource() {
    echo "${BLUE}✏️  Update Resource${NC}"
    echo
    
    # First list resources for reference
    list_resources
    
    read -p "Enter the Resource ID (database ID) to update: " resourceDbId
    echo
    echo "Leave fields empty to keep current values:"
    read -p "New Display Name: " name
    read -p "New Type: " type
    read -p "New Total Units: " totalUnits
    read -p "New Status (active/idle/maintenance): " status
    
    # Build JSON payload with only non-empty fields
    json_payload="{"
    first=true
    
    if [[ -n "$name" ]]; then
        [[ $first == false ]] && json_payload+=","
        json_payload+="\"name\": \"$name\""
        first=false
    fi
    
    if [[ -n "$type" ]]; then
        [[ $first == false ]] && json_payload+=","
        json_payload+="\"type\": \"$type\""
        first=false
    fi
    
    if [[ -n "$totalUnits" ]]; then
        [[ $first == false ]] && json_payload+=","
        json_payload+="\"totalUnits\": \"$totalUnits\""
        first=false
    fi
    
    if [[ -n "$status" ]]; then
        [[ $first == false ]] && json_payload+=","
        json_payload+="\"status\": \"$status\""
        first=false
    fi
    
    json_payload+="}"
    
    if [[ $json_payload == "{}" ]]; then
        echo "No changes specified."
        return
    fi
    
    echo
    echo "Updating resource..."
    
    response=$(curl -s -X PUT "$API_URL/$resourceDbId" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    if [[ $? -eq 0 ]] && [[ $response != *"error"* ]]; then
        echo "${GREEN}✅ Resource updated successfully${NC}"
    else
        echo "${RED}❌ Failed to update resource${NC}"
        echo "Response: $response"
    fi
    echo
}

# Main menu
while true; do
    echo "What would you like to do?"
    echo "1. List all resources"
    echo "2. Add new resource"
    echo "3. Update existing resource"
    echo "4. Delete resource"
    echo "5. Exit"
    echo
    read -p "Choose an option (1-5): " choice
    echo
    
    case $choice in
        1) list_resources ;;
        2) add_resource ;;
        3) update_resource ;;
        4) delete_resource ;;
        5) echo "Goodbye! 👋"; break ;;
        *) echo "${RED}Invalid option. Please choose 1-5.${NC}"; echo ;;
    esac
done 