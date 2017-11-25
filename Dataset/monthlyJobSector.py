import csv
import json
from datetime import datetime

outputJsonFile = "createdFiles/jobByMonth.json"
outputCsvFile = "createdFiles/jobByMonth.csv"


data = {
    "jobs": []
}

jobTreeData = json.load(open('createdFiles/jobTree.json'))

jobList = sorted(jobTreeData['children'], key=lambda k: k['value'], reverse=True)

for job in jobList:
    if job["name"] != "":
        data['jobs'].append({
            'name': job['name'],
            'total-certified': 0
        })

for job in data['jobs']:
    for year in range(2011, 2017):
        for month in range(1,13):
            date = str(month) + "/1/" + str(year)
            job[date] = 0

def updateData(jobGroup, dateString):
    dt = datetime.strptime(dateString, "%m/%d/%y")
    year = dt.year
    month = dt.month
    dateKey = str(month) + "/1/" + str(year)
    for job in data['jobs']:
        if job['name'] == jobGroup:
            job[dateKey] = job[dateKey] + 1
            job['total-certified'] = job['total-certified'] + 1

with open('metaFiles/final.csv', 'rb') as csvMain:
    reader = csv.reader(csvMain)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        dateString = row[5]
        status = row[2]
        jobGroup = row[14]
        if status == "Certified":
            updateData(jobGroup, dateString)

with open(outputCsvFile, 'wb') as outputCSV:
    writer = csv.writer(outputCSV)
    headerRow = ['key', 'value', 'date']
    writer.writerow(headerRow)
    for job in data['jobs']:
        for year in range(2011, 2017):
            for month in range(1,13):
                date = str(month) + "/1/" + str(year)
                outputDate = str(month) + "/1/" + str(year)[2:]
                jobName = job['name']
                jobCount = job[date]
                row = [jobName, jobCount, outputDate]
                writer.writerow(row)
    outputCSV.close()

with open(outputJsonFile, 'wb') as outputJSON:
    json.dump(data, outputJSON)
    outputJSON.close()