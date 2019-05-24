# INDIAN LOKSABHA ELECTION 2019 DATASET

This data is extracted from the election commission website: http://results.eci.gov.in

Data is available in JSON as well as CSV format. votes.csv & votes.json contains the votes for each candidates along with vote share and other details.

The extracting program is saving data to mongodb, if you are interested in modifying or running the program then please install all the prerequisites for the program to run.

## Pre requisites
1. Node js, Version 10 or above
2. MongoDB
3. Git Bash (for git clone)

## Installation
```
    git clone https://github.com/r21meghashyam/indian-election-2019-dataset.git
    cd indian-election-2019-dataset
    npm install
```

# Run
Assuming mongo server is running in background.
```
    node .
```

# Tips
Format of Constituency wise page url.
```
http://results.eci.gov.in/pc/en/constituencywise/Constituencywise${province_id}${constituency_id}.htm?ac=${constituency_id}`
```