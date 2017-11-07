import csv
import re
from datetime import datetime

currentFile = "metaFiles/edited.csv"
newFile = "metaFiles/final.csv"

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

stateAbbreviations = {
    'AL': "Alabama",
    'AK': "Alaska",
    'AZ': "Arizona",
    'AR': "Arkansas",
    'CA': "California",
    'CO': "Colorado",
    'CT': "Connecticut",
    'DE': "Delaware",
    'FL': "Florida",
    'GA': "Georgia",
    'HI': "Hawaii",
    'ID': "Idaho",
    'IL': "Illinois",
    'IN': "Indiana",
    'IA': "Iowa",
    'KS': "Kansas",
    'KY': "Kentucky",
    'LA': "Louisiana",
    'ME': "Maine",
    'MD': "Maryland",
    'MA': "Massachusetts",
    'MI': "Michigan",
    'MN': "Minnesota",
    'MS': "Mississippi",
    'MO': "Missouri",
    'MT': "Montana",
    'NE': "Nebraska",
    'NV': "Nevada",
    'NH': "New Hampshire",
    'NJ': "New Jersey",
    'NM': "New Mexico",
    'NY': "New York",
    'NC': "North Carolina",
    'ND': "North Dakota",
    'OH': "Ohio",
    'OK': "Oklahoma",
    'OR': "Oregon",
    'PA': "Pennsylvania",
    'RI': "Rhode Island",
    'SC': "South Carolina",
    'SD': "South Dakota",
    'TN': "Tennessee",
    'TX': "Texas",
    'UT': "Utah",
    'VT': "Vermont",
    'VA': "Virginia",
    'WA': "Washington",
    'WV': "West Virginia",
    'WI': "Wisconsin",
    'WY': "Wyoming",
    # U.S. Commonwealth/Territories
    'AS': "American Samoa",
    'DC': "District of Columbia",
    'FM': "Federated States of Micronesia",
    'GU': "Guam",
    'MH': "Marshall Islands",
    'MP': "Northern Mariana Islands",
    'PW': "Palau",
    'PR': "Puerto Rico",
    'VI': "Virgin Islands",
    # Others
    'BC': "British Columbia"
}

def getProcessingTime(receivedDate, decisionDate):
    if(receivedDate == ""):
        return "N/A"
    date_format = "%m/%d/%y"
    received = datetime.strptime(receivedDate, date_format)
    decision = datetime.strptime(decisionDate, date_format)
    difference = decision - received
    return difference.days

def rightFormat(code):
    if re.search(r'\d\d\d\d', code):
        return True
    else:
        return False

def getStateName(state):
    if(state in stateAbbreviations):
        return stateAbbreviations[state].title()
    else:
        return state.title() #Capitalize only the first letter of the word

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
        headerRow = [header[0], header[1], header[2], header[3], header[4], header[5], 'processing_time', header[6], header[8], header[9], header[10], header[11], header[12], header[13], 'pw_occupation_group', header[15], header[16], header[17], header[18], header[19], header[20]]
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
            processingTime = str(getProcessingTime(row[1], row[5]))
            row[6] = row[6].replace(",", "").title() #Replacing ',' character in "Employer_city"
            row[9] = getStateName(row[9])
            row[10] = row[10].replace(",", "").title()
            row[11] = getStateName(row[11])
            row[16] = row[16].replace(",", "")
            row[17] = normalizePayUnit(row[17])
            row[18] = row[18].replace(",", "")
            row[19] = row[19].replace(",", "")
            if row[18] == "":
                row[18] = row[21].replace(",", "")
            if row[19] == "":
                row[19] = row[22].replace(",", "")
            if row[20] == "":
                row[20] = row[23].replace(",", "")
            row[20] = normalizePayUnit(row[20])
            inputRow = [row[0], row[1], row[2], row[3], row[4], row[5], processingTime, row[6], row[8], row[9], row[10], row[11], row[12], row[13], occupationClass, row[15], row[16], row[17], row[18], row[19], row[20]]
            # count += 1
            writer.writerow(inputRow)
        print count
    
    # Closing csv files
    csvData.close()
csvFinal.close()