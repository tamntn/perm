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
            "value": value,
            "children": []
        })
    csvFile.close()


def updateDataTree(jobGroup, jobTitle):
    for group in data['children']:
        if group['name'] == jobGroup:
            updated = False
            for job in group['children']:
                if job["name"] == jobTitle:
                    job["value"] = job["value"] + 1
                    updated = True
                    break
            if updated == False:
                group['children'].append({
                    "name": jobTitle,
                    "value": 0
                })
            break


with open("metaFiles/final.csv", 'rb') as csvMain:
    reader = csv.reader(csvMain)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        jobGroup = row[14]
        jobTitle = row[15]
        updateDataTree(jobGroup, jobTitle)
    csvMain.close()

with open(treeFile, 'wb') as tree:
    json.dump(data, tree)
    tree.close()
