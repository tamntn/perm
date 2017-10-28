import csv

inputFile = "final.csv"

acceptanceRateByCountry = "acceptanceRateByCountry.csv"
acceptanceRateByCountryDict = {}

acceptanceRateByState = "acceptanceRateByState.csv"
acceptanceRateByStateDict = {}

def checkState(state):
    if state == "":
        return "N/A"
    else:
        return state

def updateAcceptanceRateByCountryDict(country, status):
    if country not in acceptanceRateByCountryDict:
        acceptanceRateByCountryDict[country] = [0, 0, 0, 0]
    countryCertifiedCount = acceptanceRateByCountryDict[country][0]
    countryCertifiedExpiredCount = acceptanceRateByCountryDict[country][1]
    countryDeniedCount = acceptanceRateByCountryDict[country][2]
    countryWithdrawnCount = acceptanceRateByCountryDict[country][3]
    if status == "Certified":
        acceptanceRateByCountryDict[country] = [countryCertifiedCount + 1, countryCertifiedExpiredCount, countryDeniedCount, countryWithdrawnCount]
    elif status == "Certified-Expired":
        acceptanceRateByCountryDict[country] = [countryCertifiedCount, countryCertifiedExpiredCount + 1, countryDeniedCount, countryWithdrawnCount]
    elif status == "Denied":
        acceptanceRateByCountryDict[country] = [countryCertifiedCount, countryCertifiedExpiredCount, countryDeniedCount + 1, countryWithdrawnCount]
    elif status == "Withdrawn":
        acceptanceRateByCountryDict[country] = [countryCertifiedCount, countryCertifiedExpiredCount, countryDeniedCount, countryWithdrawnCount + 1]

def updateAcceptanceRateByStateDict(state, status):
    if state not in acceptanceRateByStateDict:
        acceptanceRateByStateDict[state] = [0, 0, 0, 0]
    stateCertifiedCount = acceptanceRateByStateDict[state][0]
    stateCertifiedExpiredCount = acceptanceRateByStateDict[state][1]
    stateDeniedCount = acceptanceRateByStateDict[state][2]
    stateWithdrawnCount = acceptanceRateByStateDict[state][3]
    if status == "Certified":
        acceptanceRateByStateDict[state] = [stateCertifiedCount + 1, stateCertifiedExpiredCount, stateDeniedCount, stateWithdrawnCount]
    elif status == "Certified-Expired":
        acceptanceRateByStateDict[state] = [stateCertifiedCount, stateCertifiedExpiredCount + 1, stateDeniedCount, stateWithdrawnCount]
    elif status == "Denied":
        acceptanceRateByStateDict[state] = [stateCertifiedCount, stateCertifiedExpiredCount, stateDeniedCount + 1, stateWithdrawnCount]
    elif status == "Withdrawn":
        acceptanceRateByStateDict[state] = [stateCertifiedCount, stateCertifiedExpiredCount, stateDeniedCount, stateWithdrawnCount + 1]

with open(inputFile, 'rb') as inputCSV:
    reader = csv.reader(inputCSV)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        country = row[4]
        state = checkState(row[11])
        status = row[2]
        updateAcceptanceRateByStateDict(state, status)
        updateAcceptanceRateByCountryDict(country, status)

inputCSV.close()

with open(acceptanceRateByState, 'wb') as csv1:
    writer = csv.writer(csv1)
csv1.close()


for key in acceptanceRateByCountryDict:
    print key
    print acceptanceRateByCountryDict[key]
