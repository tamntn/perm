import csv

currentFile = "edited.csv"
newFile = "final.csv"

with open(newFile, 'wb') as csvFinal:
    writer = csv.writer(csvFinal, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    with open(currentFile, 'rb') as csvData:
        reader = csv.reader(csvData)
        header = reader.next()
        headerRow = [header[0], header[1], header[2], header[3], header[4], header[5], header[6], header[8], header[9], header[10], header[11], header[12], header[13], header[15], header[16], header[17], header[18], header[19], header[20]]
        writer.writerow(headerRow)
        rows = [row for row in reader if row]
        print len(rows)
        count = 0
        for row in rows:
            row[6] = row[6].replace(",", "") #Replacing ',' character in "Employer_city"
            row[10] = row[10].replace(",", "")
            row[16] = row[16].replace(",", "")
            row[18] = row[18].replace(",", "")
            row[19] = row[19].replace(",", "")
            if row[18] == "":
                row[18] = row[21]
            if row[19] == "":
                row[19] = row[22]
            if row[20] == "":
                row[20] = row[23]
            inputRow = [row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[8], row[9], row[10], row[11], row[12], row[13], row[15], row[16], row[17], row[18], row[19], row[20]]
            count += 1
            writer.writerow(inputRow)
        print count
    
    csvData.close()
csvFinal.close()
    