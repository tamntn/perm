import csv
import json

inputFile = "metaFiles/final.csv"

outputFile1 = "createdFiles/countryProcessingTimeTotal.json"
outputFile2 = "createdFiles/countryProcessingTimeCertified.json"

dataTotal = []
dataCertified = []


def updateCountryProcessingTotal(country, time):
    updated = False
    for item in dataTotal:
        if item['name'] == country:
            total = item['average'] * item['count'] + time  # new total
            item['count'] = item['count'] + 1  # new count
            average = total / item['count']
            item['average'] = average
            updated = True
            break
    if updated == False:
        dataTotal.append({
            'name': country,
            'count': 1,
            'average': time
        })


def updateCountryProcessingCertified(country, time):
    updated = False
    for item in dataCertified:
        if item['name'] == country:
            total = item['average'] * item['count'] + time  # new total
            item['count'] = item['count'] + 1  # new count
            average = total / item['count']
            item['average'] = average
            updated = True
            break
    if updated == False:
        dataCertified.append({
            'name': country,
            'count': 1,
            'average': time
        })


with open(inputFile, 'rb') as inputCSV:
    reader = csv.reader(inputCSV)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        status = row[1]
        country = row[3]
        time = row[5]
        if time != "N/A" and time != "0":
            updateCountryProcessingTotal(country, float(time))
            if status == "Certified":
                updateCountryProcessingCertified(country, float(time))
    inputCSV.close()

for item in dataTotal:
    item['average'] = int(item['average'])

for item in dataCertified:
    item['average'] = int(item['average'])

with open(outputFile1, 'wb') as output:
    json.dump(dataTotal, output)
    output.close()

with open(outputFile2, 'wb') as output:
    json.dump(dataCertified, output)
    output.close()
