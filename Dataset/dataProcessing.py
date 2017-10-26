import csv
import re

currentFile = "edited.csv"
newFile = "final.csv"
occupationClassifications = {
    '11': "Management Occupations",
    '13': "Business and Financial Operations Occupations",
    '15': "Computer and Mathematical Occupations",
    '17': "Architecture and Engineering Occupations",
    '19': "Life Physical and Social Science Occupations",
    '21': "Community and Social Service Occupations",
    '23': "Legal Occupations",
    '25': "Education, Training, and Library Occupations",
    '27': "Arts, Design, Entertainment, Sports, and Media Occupations",
    '29': "Healthcare Practitioners and Technical Occupations",
    '31': "Healthcare Support Occupations",
    '33': "Protective Service Occupations",
    '35': "Food Preparation and Serving Related Occupations",
    '37': "Building and Grounds Cleaning and Maintenance Occupations",
    '39': "Personal Care and Service Occupations",
    '41': "Sales and Related Occupations",
    '43': "Office and Administrative Support Occupations",
    '45': "Farming, Fishing, and Forestry Occupations",
    '47': "Construction and Extraction Occupations",
    '49': "Installation, Maintenance, and Repair Occupations",
    '51': "Production Occupations",
    '53': "Transportation and Material Moving Occupations",
    '55': "Military Specific Occupations"
}

def rightFormat(code):
    if re.search(r'\d\d\d\d', code):
        print code
        return True
    else:
        return False

def occupationClassify(code):
    shortenCode = code[:2]
    return occupationClassifications[str(shortenCode)]

def normalizePayUnit(unit):
    firstLetter = unit[:1].lower()
    if firstLetter == 'b':
        return "Bi-Weekly"
    elif firstLetter == 'h':
        return "Hourly"
    elif firstLetter == 'm':
        return "Monthly"
    elif firstLetter == 'w':
        return "Weekly"
    elif firstLetter == 'y':
        return "Yearly"
    else:
        return ""
    

with open(newFile, 'wb') as csvFinal:
    writer = csv.writer(csvFinal)
    with open(currentFile, 'rb') as csvData:
        reader = csv.reader(csvData)
        header = reader.next()
        headerRow = [header[0], header[1], header[2], header[3], header[4], header[5], header[6], header[8], header[9], header[10], header[11], header[12], header[13], 'occupation_class', header[15], header[16], header[17], header[18], header[19], header[20]]
        writer.writerow(headerRow)
        rows = [row for row in reader if row]
        print len(rows)
        count = 0
        for row in rows:
            if(row[13] != ""):
                row[13] = row[13][:7].replace("-", "")
                occupationClass = occupationClassify(row[13])
            else:
                row[13] = ""
                occupationClass = ""
                count += 1
            row[6] = row[6].replace(",", "") #Replacing ',' character in "Employer_city"
            row[10] = row[10].replace(",", "")
            row[16] = row[16].replace(",", "")
            row[18] = row[18].replace(",", "")
            row[17] = normalizePayUnit(row[17])
            row[19] = row[19].replace(",", "")
            if row[18] == "":
                row[18] = row[21].replace(",", "")
            if row[19] == "":
                row[19] = row[22].replace(",", "")
            if row[20] == "":
                row[20] = row[23].replace(",", "")
            row[20] = normalizePayUnit(row[20])
            inputRow = [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[8], row[9], row[10], row[11], row[12], row[13], occupationClass, row[15], row[16], row[17], row[18], row[19], row[20]]
            # count += 1
            writer.writerow(inputRow)
        print count
    
    # Closing csv files
    csvData.close()
csvFinal.close()