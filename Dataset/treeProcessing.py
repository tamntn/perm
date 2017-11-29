import csv
import json

treeFile = "createdFiles/jobTree.json"
treeMapFile = "createdFiles/jobTreeMap.json"

data = {
    "name": "Job",
    "children": []
}

treemapdata = []

with open("createdFiles/acceptanceRateByJob.csv", 'rb') as csvFile:
    reader = csv.reader(csvFile)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        name = row[0]
        value = int(row[1]) + int(row[2]) + int(row[3]) + int(row[4])
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
                    "value": 1
                })
            break

def updateDataTreeMap(jobGroup, jobTitle, subGroup):
    updated = False
    for job in treemapdata:
        if job["key"] == jobTitle:
            job["value"] = job["value"] + 1
            updated = True
            break
    if updated == False:
        treemapdata.append({
            "key": jobTitle,
            "region": jobGroup,
            "subregion": subGroup,
            "value": 1
        })

with open("metaFiles/final.csv", 'rb') as csvMain:
    reader = csv.reader(csvMain)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        jobGroup = row[13]
        jobTitle = row[14]
        subGroup = row[15]
        updateDataTree(jobGroup, jobTitle)
        updateDataTreeMap(jobGroup, jobTitle, subGroup)
    csvMain.close()

with open(treeFile, 'wb') as tree:
    json.dump(data, tree)
    tree.close()

with open(treeMapFile, 'wb') as treemap:
    json.dump(treemapdata, treemap)
    treemap.close()