#!/bin/bash

# Delete old resources, keeping only the 5 newly added ones
API_URL="https://experiment-tracker-production.up.railway.app/api/resources"

echo "🗑️  Cleaning up old resources..."
echo "Keeping: AWS A100, Lambda Labs A100, Trossen ARM, ARCTOS, Genesis Hand"
echo

# Resources to delete (old sample resources)
resources_to_delete=(
  "cmcde0qzv0008wy3m4hg5rvx1:CPU Processing Cluster"
  "cmcde0qzu0005wy3m3af1o7wq:GPU Cluster Alpha" 
  "cmcde0qzu0007wy3mmy7tyc54:GPU Cluster Beta"
  "cmcde0qzu0006wy3mygnfbtf1:Physical Lab A"
  "cmcde0qzv0009wy3mavr8sn5c:Primary Storage"
)

for resource in "${resources_to_delete[@]}"; do
  IFS=':' read -r resource_id resource_name <<< "$resource"
  
  echo "Deleting: $resource_name"
  response=$(curl -s -X DELETE "$API_URL/$resource_id")
  
  if [[ $response == *"deleted successfully"* ]]; then
    echo "  ✅ Successfully deleted: $resource_name"
  elif [[ $response == *"active experiments"* ]]; then
    echo "  ⚠️  Cannot delete $resource_name - has active experiments"
  elif [[ $response == *"not found"* ]]; then
    echo "  ℹ️  $resource_name already deleted or not found"
  else
    echo "  ❌ Error deleting $resource_name"
    echo "  Response: $response"
  fi
  echo
done

echo "🎉 Cleanup complete!"
echo
echo "Remaining resources:"
curl -s "$API_URL" | python3 -c "
import json, sys
try:
  data = json.load(sys.stdin)
  resources = data.get('resources', [])
  for r in resources:
    print(f'  ✅ {r[\"name\"]} ({r[\"type\"]}): {r[\"totalUnits\"]}')
except:
  print('  Error fetching remaining resources')
"
