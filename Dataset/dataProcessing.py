import csv
import collections

inputFile = "metaFiles/final.csv"

acceptanceRateByCountryFile = "createdFiles/acceptanceRateByCountry.csv"
acceptanceRateByCountryDict = {}

acceptanceRateByStateFile = "createdFiles/acceptanceRateByState.csv"
acceptanceRateByStateDict = {}

acceptanceRateByJobFile = "createdFiles/acceptanceRateByJob.csv"
acceptanceRateByJobDict = {}

acceptanceRateByClassFile = "createdFiles/acceptanceRateByClass.csv"
acceptanceRateByClassDict = {}

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

def updateAcceptanceRateByJobDict(job, status):
    if job not in acceptanceRateByJobDict:
        acceptanceRateByJobDict[job] = [0, 0, 0, 0]
    jobCertifiedCount = acceptanceRateByJobDict[job][0]
    jobCertifiedExpiredCount = acceptanceRateByJobDict[job][1]
    jobDeniedCount = acceptanceRateByJobDict[job][2]
    jobWithdrawnCount = acceptanceRateByJobDict[job][3]
    if status == "Certified":
        acceptanceRateByJobDict[job] = [jobCertifiedCount + 1, jobCertifiedExpiredCount, jobDeniedCount, jobWithdrawnCount]
    elif status == "Certified-Expired":
        acceptanceRateByJobDict[job] = [jobCertifiedCount, jobCertifiedExpiredCount + 1, jobDeniedCount, jobWithdrawnCount]
    elif status == "Denied":
        acceptanceRateByJobDict[job] = [jobCertifiedCount, jobCertifiedExpiredCount, jobDeniedCount + 1, jobWithdrawnCount]
    elif status == "Withdrawn":
        acceptanceRateByJobDict[job] = [jobCertifiedCount, jobCertifiedExpiredCount, jobDeniedCount, jobWithdrawnCount + 1]

def updateAcceptanceRateByClassDict(admissionClass, status):
    if admissionClass not in acceptanceRateByClassDict:
        acceptanceRateByClassDict[admissionClass] = [0, 0, 0, 0]
    classCertifiedCount = acceptanceRateByClassDict[admissionClass][0]
    classCertifiedExpiredCount = acceptanceRateByClassDict[admissionClass][1]
    classDeniedCount = acceptanceRateByClassDict[admissionClass][2]
    classWithdrawnCount = acceptanceRateByClassDict[admissionClass][3]
    if status == "Certified":
        acceptanceRateByClassDict[admissionClass] = [classCertifiedCount + 1, classCertifiedExpiredCount, classDeniedCount, classWithdrawnCount]
    elif status == "Certified-Expired":
        acceptanceRateByClassDict[admissionClass] = [classCertifiedCount, classCertifiedExpiredCount + 1, classDeniedCount, classWithdrawnCount]
    elif status == "Denied":
        acceptanceRateByClassDict[admissionClass] = [classCertifiedCount, classCertifiedExpiredCount, classDeniedCount + 1, classWithdrawnCount]
    elif status == 'Withdrawn':
        acceptanceRateByClassDict[admissionClass] = [classCertifiedCount, classCertifiedExpiredCount, classDeniedCount, classWithdrawnCount + 1]

def calculatePercentage(mydict):
    for key in mydict:
        total = mydict[key][0] + mydict[key][1] + mydict[key][2] + mydict[key][3]
        certifiedPercentage = round((float(mydict[key][0]) / total * 100), 2)
        certifiedExpiredPercentage = round((float(mydict[key][1]) / total * 100), 2)
        deniedPercentage = round((float(mydict[key][3]) / total * 100), 2)
        withdrawnPercentage = round((100 - certifiedPercentage - certifiedExpiredPercentage - deniedPercentage), 2)
        mydict[key].append(certifiedPercentage)
        mydict[key].append(certifiedExpiredPercentage)
        mydict[key].append(deniedPercentage)
        mydict[key].append(withdrawnPercentage)

with open(inputFile, 'rb') as inputCSV:
    reader = csv.reader(inputCSV)
    header = reader.next()
    rows = [row for row in reader if row]
    for row in rows:
        country = row[3]
        state = checkState(row[10])
        status = row[1]
        admissionClass = row[2]
        job_group = row[13]
        updateAcceptanceRateByStateDict(state, status)
        updateAcceptanceRateByCountryDict(country, status)
        updateAcceptanceRateByJobDict(job_group, status)
        updateAcceptanceRateByClassDict(admissionClass, status)
    inputCSV.close()

# sorting dictionary
acceptanceRateByCountryDict = collections.OrderedDict(sorted(acceptanceRateByCountryDict.items()))
acceptanceRateByStateDict = collections.OrderedDict(sorted(acceptanceRateByStateDict.items()))

with open(acceptanceRateByCountryFile, 'wb') as csv1:
    writer = csv.writer(csv1)
    headerRow = ['Country', 'Certified', 'Certified-Expired', 'Denied', 'Withdrawn']
    writer.writerow(headerRow)
    for key in acceptanceRateByCountryDict:
        inputRow =[key, acceptanceRateByCountryDict[key][0], acceptanceRateByCountryDict[key][1], acceptanceRateByCountryDict[key][2], acceptanceRateByCountryDict[key][3]]
        writer.writerow(inputRow)
    csv1.close()

with open(acceptanceRateByStateFile, 'wb') as csv2:
    writer = csv.writer(csv2)
    headerRow = ['State', 'Certified', 'Certified-Expired', 'Denied', 'Withdrawn']
    writer.writerow(headerRow)
    for key in acceptanceRateByStateDict:
        inputRow = [key, acceptanceRateByStateDict[key][0], acceptanceRateByStateDict[key][1], acceptanceRateByStateDict[key][2], acceptanceRateByStateDict[key][3]]
        writer.writerow(inputRow)
    csv2.close()

with open(acceptanceRateByJobFile, 'wb') as csv3:
    writer = csv.writer(csv3)
    headerRow = ['Job', 'Certified', 'Certified-Expired', 'Denied', 'Withdrawn']
    writer.writerow(headerRow)
    for key in acceptanceRateByJobDict:
        inputRow = [key, acceptanceRateByJobDict[key][0], acceptanceRateByJobDict[key][1], acceptanceRateByJobDict[key][2], acceptanceRateByJobDict[key][3]]
        writer.writerow(inputRow)
    csv3.close()

with open(acceptanceRateByClassFile, 'wb') as csv4:
    writer = csv.writer(csv4)
    headerRow = ['Admission Class', 'Certified', 'Certified-Expired', 'Denied', 'Withdrawn', 'Percentage-Certified', 'Percentage-Certified-Expired', 'Percentage-Denied', 'Percentage-Withdrawn']
    writer.writerow(headerRow)
    calculatePercentage(acceptanceRateByClassDict)
    for key in acceptanceRateByClassDict:
        inputRow = [key, acceptanceRateByClassDict[key][0], acceptanceRateByClassDict[key][1], acceptanceRateByClassDict[key][2], acceptanceRateByClassDict[key][3], acceptanceRateByClassDict[key][4], acceptanceRateByClassDict[key][5], acceptanceRateByClassDict[key][6], acceptanceRateByClassDict[key][7]]
        writer.writerow(inputRow)
    csv4.close()

# for key in acceptanceRateByStateDict:
#     print key
#     print acceptanceRateByStateDict[key]
