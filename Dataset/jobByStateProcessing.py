import csv
import json

outputFile = "createdFiles/jobByState.json"
data = {
    "states": []
}

with open("../US_map/acceptanceRateByState.csv", 'rb') as csvFile:
    reader = csv.reader(csvFile)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        stateID = row[0]
        name = row[1]
        abbr = row[2]
        cert = int(row[3])
        certex = int(row[4])
        denied = int(row[5])
        withdrawn = int(row[6])
        if stateID != "":
            data["states"].append({
                "id": stateID,
                "name": name,
                "abbr": abbr,
                "certified": cert,
                "certified-expired": certex,
                "denied": denied,
                "withdrawn": withdrawn,
                "jobGroup": []
            })
    csvFile.close()

def updateData(state, jobGroup, status):
    for dataState in data['states']:
        if dataState['name'] == state:
            updated = False
            for job in dataState['jobGroup']:
                if job["name"] == jobGroup:
                    job[status] = job[status] + 1
                    updated = True
                    break
            if updated == False:
                cert = 0
                certex = 0
                denied = 0
                withdrawn = 0
                if status == "Certified":
                    cert = 1
                elif status == "Certified-Expired":
                    certex = 1
                elif status == "Denied":
                    denied = 1
                elif status == "Withdrawn":
                    withdrawn = 1
                dataState['jobGroup'].append({
                    "name": jobGroup,
                    "Certified": cert,
                    "Certified-Expired": certex,
                    "Denied": denied,
                    "Withdrawn": withdrawn
                })
            break


with open('metaFiles/final.csv', 'rb') as csvMain:
    reader = csv.reader(csvMain)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        state = row[11]
        jobGroup = row[14]
        status = row[2]
        updateData(state, jobGroup, status)
    csvMain.close()

with open(outputFile, 'wb') as output:
    json.dump(data, output)
    output.close()
