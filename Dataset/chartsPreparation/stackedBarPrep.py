import csv
import json

inputFile = "acceptanceRateByState.csv"
bystate = {}
bystate["labels"]=[];
bystate["series"]=[[],[],[],[]];




with open(inputFile, 'rb') as inputCSV:
    reader = csv.reader(inputCSV)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        state = row[0]
        bystate["labels"].append(state)
        certified = int(row[1])
        bystate["series"][0].append(certified)
        certifiedExp = int(row[2])
        bystate["series"][1].append(certifiedExp)
        denied = int(row[3])
        bystate["series"][2].append(denied)
        withdrawn = int(row[4])
        bystate["series"][3].append(withdrawn)
    inputCSV.close()




with open('count.json', 'wb') as outfile:
    json.dump(bystate,outfile)
