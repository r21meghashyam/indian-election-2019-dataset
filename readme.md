# INDIAN LOKSABHA ELECTION 2019 DATASET

This data is extracted from the election commission website: http://results.eci.gov.in

Data is available in JSON as well as CSV format. votes.csv & votes.json contains the votes for each candidates along with vote share and other details.

index.js extracts the data and stores it in votes.json in the same folder. It is a minfied file.

usemongo.js needs mongoDB server running, it just stores the extracted data in the database. Here data is extracted and the data is saved as json & csv.

## Pre requisites
1. Node js, Version 10 or above
2. MongoDB (optional)
3. Git Bash (optional, for git clone)

## Installation
```
    git clone https://github.com/r21meghashyam/indian-election-2019-dataset.git
    cd indian-election-2019-dataset
    npm install
```

# Run
```
    node index.js
```

## Running with Mongodb
Assuming mongo server is running in background.
```
    node usemongo.js
```

# Tips
Format of Constituency wise page url.
```
http://results.eci.gov.in/pc/en/constituencywise/Constituencywise${province_id}${constituency_id}.htm?ac=${constituency_id}`
```