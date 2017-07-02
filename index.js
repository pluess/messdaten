let google = require('googleapis');
let authentication = require("./authentication");
let dateTime = require('node-datetime');
let httpClient = require('node-rest-client').Client;


// This code originally commes from http://voidcanvas.com/node-js-googleapis-v4-spreadsheet/

// Spreadsheet ID is taken from the browser URL
// https://docs.google.com/spreadsheets/d/1fqkWl5UXT_q5rxAOxCQGId1dg8K7t2uENmDGF1K3bts/edit#gid=0
// see: https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id
let spreadsheetId = '1fqkWl5UXT_q5rxAOxCQGId1dg8K7t2uENmDGF1K3bts';

// Adds values to the End of the sheet Messdaten Random in the Google Drive of Ernst Plüss
function appendData(auth, values) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: 'Tabellenblatt1!A1:B', //Change Sheet1 if your worksheet's name is something else
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        resource: {
            values: values
        }
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        } else {
            console.log(response.updates);
            console.log("Appended");
        }
    });
}

let auth;
authentication.authenticate().then(a => auth = a);

let client = new httpClient();

// Arguments to get 100 random numbers from radnom.org
let postArgs = {
    headers: { "Content-Type": "application/json-rpc" },
    data: JSON.stringify({
        "jsonrpc": "2.0",
        "method": "generateIntegers",
        "params": {
            "apiKey": "967c4f2f-99c0-4cc9-b9a3-07f8856ed777",
            "n": 100,
            "min": 1,
            "max": 100,
            "replacement": true,
            "base": 10
        },
        "id": 26032
    })
};

client.post('https://api.random.org/json-rpc/1/invoke', postArgs, (data, respose) => {
    let i = 0;
    let m = 30;
    let now = dateTime.create();
    let sheetValues = [];

    // fill values for 100 random values with continuos date values
    data.result.random.data.forEach(value => {
        i++;

        let date = now.format('d.m.Y H:') + m + ':' + i;

        console.log(date + ", " + value);

        sheetValues.push([date, value]);
        if (i == 60) {
            i = 0;
            m++;
        }
    });

    appendData(auth, sheetValues);

});