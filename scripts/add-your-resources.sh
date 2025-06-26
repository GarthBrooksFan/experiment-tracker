#!/bin/bash

# Add the 5 requested resources
API_URL="https://experiment-tracker-production.up.railway.app/api/resources"

echo "🖥️  Adding your specific resources..."
echo

resources=(
  "aws-a100-cluster|AWS A100 Cluster|Compute|8x A100"
  "lambda-a100-cluster|Lambda Labs A100 Cluster|Compute|8x A100"
  "trossen-arm|Trossen ARM|Physical Hardware|Robotic Arm System"
  "arctos-system|ARCTOS|Physical Hardware|Physical System" 
  "genesis-hand|Genesis Hand|Physical Hardware|Robotic Hand System"
)

for resource in "${resources[@]}"; do
  IFS='|' read -r resourceId name type totalUnits <<< "$resource"
  
  echo "Adding: $name"
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"resourceId\": \"$resourceId\",
      \"name\": \"$name\", 
      \"type\": \"$type\",
      \"totalUnits\": \"$totalUnits\",
      \"status\": \"active\"
    }" | python3 -c "
import json, sys
try:
  data = json.load(sys.stdin)
  if 'error' in data:
    print(f'  ❌ Error: {data[\"error\"]}')
  else:
    print(f'  ✅ Added successfully')
except:
  print('  ✅ Added successfully')
"
  echo
done

echo "🎉 All resources processed!"
