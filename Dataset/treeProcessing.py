import csv
import json

treeFile = "createdFiles/jobTree.json"
treeMapFile = "createdFiles/treemapTOTAL.json"
treeMapCertFile = "createdFiles/treemapCERT.json"
treeMapWageFile = "createdFiles/treemapWAGE.json"

data = {
    "name": "Job",
    "children": []
}

treemapTOTAL = []
treemapCERT = []
treemapWAGE = []

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

def updateTreeMapTOTAL(jobGroup, jobTitle, subGroup):
    updated = False
    for job in treemapTOTAL:
        if job["key"] == jobTitle:
            job["value"] = job["value"] + 1
            updated = True
            break
    if updated == False:
        treemapTOTAL.append({
            "key": jobTitle,
            "group": jobGroup,
            "subgroup": subGroup,
            "value": 1
        })

def updateTreeMapCERT(jobGroup, jobTitle, subGroup):
    updated = False
    for job in treemapCERT:
        if job["key"] == jobTitle:
            job["value"] = job["value"] + 1
            updated = True
            break
    if updated == False:
        treemapCERT.append({
            "key": jobTitle,
            "group": jobGroup,
            "subgroup": subGroup,
            "value": 1
        })

def updateTreeMapWAGE(jobGroup, jobTitle, subGroup, wage):
    updated = False
    for job in treemapWAGE:
        if job["key"] == jobTitle:
            job["value"] = job["value"] + int(round(float(wage)))
            updated = True
            break
    if updated == False:
        treemapWAGE.append({
            "key": jobTitle,
            "group": jobGroup,
            "subgroup": subGroup,
            "value": int(round(float(wage)))
        })

with open("metaFiles/final.csv", 'rb') as csvMain:
    reader = csv.reader(csvMain)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        status = row[1]
        jobGroup = row[13]
        jobTitle = row[14]
        subGroup = row[15]
        wage = row[21]
        updateDataTree(jobGroup, jobTitle)
        updateTreeMapTOTAL(jobGroup, jobTitle, subGroup)
        if status == "Certified":
            updateTreeMapCERT(jobGroup, jobTitle, subGroup)
        if wage != "N/A":
            updateTreeMapWAGE(jobGroup, jobTitle, subGroup, wage)
    csvMain.close()

with open(treeFile, 'wb') as tree:
    json.dump(data, tree)
    tree.close()

with open(treeMapFile, 'wb') as treemap:
    json.dump(treemapTOTAL, treemap)
    treemap.close()

with open(treeMapCertFile, 'wb') as treemapCert:
    json.dump(treemapCERT, treemapCert)
    treemapCert.close()

with open(treeMapWageFile, 'wb') as treemapWage:
    json.dump(treemapWAGE, treemapWage)
    treemapWage.close()