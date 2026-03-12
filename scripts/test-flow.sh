#!/usr/bin/env bash
# test-flow.sh — Test the Brindin platform end-to-end
# Usage: ./scripts/test-flow.sh [path/to/image1.png path/to/image2.jpg ...]

set -euo pipefail

API_URL="${API_URL:-http://localhost:3001}"
API_KEY="${API_KEY:-dev-key}"
ORG_ID="${ORG_ID:-org-1}"
BRAND_NAME="${BRAND_NAME:-Test Brand}"

header=(-H "x-api-key: $API_KEY")

echo "=== Brindin Platform Test Flow ==="
echo "API: $API_URL"
echo ""

# 1. Health check
echo "1. Health check..."
curl -sf "$API_URL/api/health" | head -c 200
echo ""
echo ""

# 2. Create a brand
echo "2. Creating brand: $BRAND_NAME"
BRAND_RESPONSE=$(curl -sf -X POST "$API_URL/api/brands" \
  "${header[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$BRAND_NAME\", \"orgId\": \"$ORG_ID\", \"categoryVertical\": \"ecommerce\"}")

BRAND_ID=$(echo "$BRAND_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || \
           echo "$BRAND_RESPONSE" | grep -oP '"id"\s*:\s*"\K[^"]+' | head -1)

if [ -z "$BRAND_ID" ]; then
  echo "Failed to create brand. Response:"
  echo "$BRAND_RESPONSE"
  exit 1
fi
echo "   Brand ID: $BRAND_ID"
echo ""

# 3. Upload creatives
IMAGES=("$@")
if [ ${#IMAGES[@]} -eq 0 ]; then
  echo "3. No images provided. Skipping upload."
  echo "   Usage: $0 image1.png image2.jpg ..."
  echo ""
  echo "   After uploading images manually, trigger extraction with:"
  echo "   curl -X POST $API_URL/api/brands/$BRAND_ID/design-system/extract ${header[*]}"
  exit 0
fi

echo "3. Uploading ${#IMAGES[@]} creative(s)..."
for img in "${IMAGES[@]}"; do
  if [ ! -f "$img" ]; then
    echo "   Skipping $img (file not found)"
    continue
  fi
  echo -n "   Uploading $(basename "$img")... "
  curl -sf -X POST "$API_URL/api/brands/$BRAND_ID/creatives/upload" \
    "${header[@]}" \
    -F "file=@$img" > /dev/null
  echo "done"
done
echo ""

# 4. List uploaded creatives
echo "4. Listing creatives..."
curl -sf "$API_URL/api/brands/$BRAND_ID/creatives" \
  "${header[@]}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 5. Trigger extraction
echo "5. Triggering design system extraction..."
EXTRACT_RESPONSE=$(curl -sf -X POST "$API_URL/api/brands/$BRAND_ID/design-system/extract" \
  "${header[@]}")

JOB_ID=$(echo "$EXTRACT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['jobId'])" 2>/dev/null || \
         echo "$EXTRACT_RESPONSE" | grep -oP '"jobId"\s*:\s*"\K[^"]+' | head -1)

echo "   Job ID: $JOB_ID"
echo "   WebSocket: ws://localhost:3001/ws/jobs/$JOB_ID"
echo ""

# 6. Poll for completion
echo "6. Polling extraction status..."
MAX_ATTEMPTS=60
for i in $(seq 1 $MAX_ATTEMPTS); do
  STATUS_RESPONSE=$(curl -sf "$API_URL/api/brands/$BRAND_ID/extraction-jobs/$JOB_ID" \
    "${header[@]}" 2>/dev/null || echo '{"status":"unknown"}')

  STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "unknown")

  if [ "$STATUS" = "completed" ]; then
    echo "   Extraction completed!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "   Extraction failed."
    echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null
    exit 1
  else
    echo "   [$i/$MAX_ATTEMPTS] Status: $STATUS — waiting 10s..."
    sleep 10
  fi
done
echo ""

# 7. Fetch the design system
echo "7. Fetching extracted design system..."
curl -sf "$API_URL/api/brands/$BRAND_ID/design-system" \
  "${header[@]}" | python3 -m json.tool 2>/dev/null
echo ""

echo "=== Test flow complete ==="
