#!/usr/bin/env bash
set -e

CSVPATH="/tmp/itest_andromeda.csv"

echo "Write temporary CSV file: $CSVPATH"
cat << EOF > $CSVPATH
Image_Label,Image_Link,R1,G1,B1
p1,https://example.com/p1.jpg,50,80,20
p2,https://example.com/p2.jpg,100,110,60
EOF

echo "Upload CSV temporary CSV file"
ID=$(curl -H "Accept: application/json"  -F "file=@${CSVPATH}" 'http://127.0.0.1:5000/api/dataset/' | jq -r '.id')
echo ""
echo "Received dataset id: $ID"

echo "Performing dimensional_reduction on $ID"
curl -X POST -H "Content-Type: application/json" \
    -d '{"weights": {"all": 0.01}, "columnSettings": {"label":"Image_Label","selected":["R1","G1","B1"]}}'  \
    http://127.0.0.1:5000/api/dataset/$ID/dimensional-reduction | jq

echo "Performing dimensional_reduction on $ID with image coordinates"
curl -X POST -H "Content-Type: application/json" \
    -d '{"images": [ { "label": "p1", "x": 0.5920513794381642, "y": -0.009178126747895218 }, { "label": "p2", "x": -0.4686290075683762, "y": -0.34844575009740675 } ], "columnSettings": {"label":"Image_Label","selected":["R1","G1","B1"]}}' \
    http://127.0.0.1:5000/api/dataset/$ID/inverse-dimensional-reduction

echo "Done"
