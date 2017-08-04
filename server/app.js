const express = require('express');
const fs = require('fs');
const path = require("path");
const app = express();

var currentLine = 1;
var fileNumber = 1;
var csvPath = path.join(__dirname, "log" + fileNumber + ".csv");

var currentLog = {
    "Agent": "",
    "Time": "",
    "Method": "",
    "Version": "",
    "Status": ""
};

var jsonLog = {
    "Agent": "",
    "Time": "",
    "Method": "",
    "Version": "",
    "Status": ""
};

console.log(__filename);

app.use((req, res, next) => {

    // Adding needed data to currentLog object to write to the csv file
    currentLog.Agent = req.headers["user-agent"].replace(",", "");
    currentLog.Time = new Date().toISOString();
    currentLog.Method = req.method;
    currentLog.Version = "HTTP/" + req.httpVersion;
    currentLog.Status = res.statusCode;
    
    // checking whether file is over 20 lines and if so create a new file to append to
    if(currentLine >= 20){
        //change currentLine back to 1 and increase the file name number by one.
        currentLine = 1;
        fileNumber++;
        csvPath = path.join(__dirname, "log" + fileNumber + ".csv");
        console.log("File Number: ", fileNumber);

        // writing the current request after the file is created
        fs.appendFile(csvPath, "Agent,Time,Method,Version,Status\n" + currentLog.Agent + "," + currentLog.Time + "," + currentLog.Method + "," + req.url + "," + currentLog.Version + "," + currentLog.Status, (err) => {
            if (err) throw err;
            next();
            // console.log('The "data to append" was appended to file!');
        });

        // Increment currentLine for accuracy
        currentLine++;

    } else {
    //write to the csv file
        fs.appendFile(csvPath, "\n" + currentLog.Agent + "," + currentLog.Time + "," + currentLog.Method + "," + req.url + "," + currentLog.Version + "," + currentLog.Status, (err) => {
            if (err) throw err;
            // console.log('The "data to append" was appended to file!');
            next();
        });
        currentLine++;
        console.log("currentLine: ", currentLine);
    }
    // Allows .use to end and go into other requests
});

app.get('/', (req, res) => {
    // write your code to respond "ok" here
    res.status(200).send("ok");
});

app.get('/logs', (req, res) => {
    // Send json 

    fs.readFile(csvPath,'utf8', (err, data) => {
        var arrofArr = []
        var logs = [];

        var firstSplit = data.split("\n");

        firstSplit.shift();


        for(var i = 0; i < firstSplit.length; i++) {
            arrofArr.push(firstSplit[i].split(","));
        }

        for(var i = 0; i < arrofArr.length; i++) {
            jsonLog.Agent = arrofArr[i][0];
            jsonLog.Time = arrofArr[i][1];
            jsonLog.Method = arrofArr[i][2];
            jsonLog.Version = arrofArr[i][3];
            jsonLog.Status = arrofArr[i][4];
            logs.push(currentLog);
        }

        res.status(200).json(logs);
    });

});

module.exports = app;
