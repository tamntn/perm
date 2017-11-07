import csv
import json

treeFile = "createdFiles/jobTree.json"

data = {
    "name": "Job",
    "children": []
}

with open("createdFiles/acceptanceRateByJob.csv", 'rb') as csvFile:
    reader = csv.reader(csvFile)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        name = row[0]
        value = int(row[1])
        data['children'].append({
            "name": name,
            "value": value
        })
    csvFile.close()

with open(treeFile, 'wb') as tree:
    json.dump(data, tree)
    tree.close()