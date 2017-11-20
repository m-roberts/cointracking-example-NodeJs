var fs = require('fs');
var crypto = require('crypto');
var fetch = require('node-fetch');
var moment = require('moment');
var FormData = require('form-data');
var http_build_query = require('qhttp/http_build_query');
var jsonfile = require('jsonfile')

const url = "https://cointracking.info/api/v1/";

const DEBUG = {
    "active": false,
    "error": false
}


const logDirName = 'logs'

apiData = jsonfile.readFileSync('api.keys');
const key = apiData.key;
const secret = apiData.secret;
delete apiData;

if ((key == null) || (secret == null)) {
    console.error("ERROR - missing API key information");
    return;
}

async function baseCoinTrackingFunc(method, params) {
    params.method = method;
    params.nonce = moment().valueOf();

    var post_data = http_build_query(params, {leave_brackets: false});

    var hash = crypto.createHmac('sha512', secret);
    hash.update(post_data);
    var sign = hash.digest('hex');

    var headers =  { 'Key': key, 'Sign': sign};

    var form = new FormData();
    for(var paramKey in params) {
        var value = params[paramKey];
        form.append(paramKey, value);
    }

    if (DEBUG.active) {
        if (DEBUG.error) {
            return {
                "success": 0,
                "error": "NONCE_TO_LOW",
                "error_msg": "ERROR: Nonce must be higher than 1511143064"
            };
        }
        else
        {
            return {
                "success": 1
            };
        }
        
    }
    else
    {
        var result = await fetch(url, {
            method: 'POST',
            body:   form,
            headers: headers,
        });
        var json = await result.json();

        return json;
    }
}

async function validateResponse(data) {
    if (data.success == 1)
    {
        return true;
    }
    else
    {
        console.error(data.error_msg)
        return false;
    }
}

async function saveDataToFile(method, data) {

    var relPath = "./" + logDirName;

    var file = relPath + "/" + method + ".json";

    if (data != null && data != undefined && data.success == 1)
    {
        if (!fs.existsSync(relPath)) {
            console.log(relPath + " does not exist - creating");
            fs.mkdirSync(relPath);
        }

        console.log("Saving data to " + file);

        jsonfile.writeFile(file, data, {spaces: 4}, function (err) {
            if (err != null)
            {
                console.error(err);
            }
        })
    }
    else
    {
        console.error("Nothing to save - skipping");
    }
}

async function baseGetFunc(method, params) {
    var res = await baseCoinTrackingFunc(method, params);
    if (validateResponse(res))
    {
        return res;
    }
    else
    {
        console.error("Error fetching from " + method)
        return {};
    }
}

async function getTrades() {
    return await baseGetFunc('getTrades', {});
}
async function getBalance() {
    return await baseGetFunc('getBalance', {});
}
async function getHistoricalSummary() {
    return await baseGetFunc('getHistoricalSummary', {});
}
async function getHistoricalCurrency() {
    return await baseGetFunc('getHistoricalCurrency', {});
}
async function getGroupedBalance() {
    return await baseGetFunc('getGroupedBalance', {});
}
async function getGains() {
    return await baseGetFunc('getGains', {});
}

async function saveTrades() {
    saveDataToFile("trades", await getTrades());
}

async function saveBalance() {
    saveDataToFile("balance", await getBalance());
}

async function saveHistoricalSummary() {
    saveDataToFile("historicalSummary", await getHistoricalSummary());
}

async function saveHistoricalCurrency() {
    saveDataToFile("historicalCurrency", await getHistoricalCurrency());
}

async function saveGroupedBalance() {
    saveDataToFile("groupedBalance", await getGroupedBalance());
}

async function saveGains() {
    saveDataToFile("gains", await getGains());
}

async function saveAll() {
    await saveTrades();
    await saveBalance();
    await saveHistoricalSummary();
    await saveHistoricalCurrency();
    await saveGroupedBalance();
    await saveGains();
}

module.exports =
{
    getTrades                   : getTrades,
    getBalance                  : getBalance,
    getHistoricalSummary        : getHistoricalSummary,
    getHistoricalCurrency       : getHistoricalCurrency,
    getGroupedBalance           : getGroupedBalance,
    getGains                    : getGains,
    saveTrades                  : saveTrades,
    saveBalance                 : saveBalance,
    saveHistoricalSummary       : saveHistoricalSummary,
    saveHistoricalCurrency      : saveHistoricalCurrency,
    saveGroupedBalance          : saveGroupedBalance,
    saveGains                   : saveGains,
    saveAll                     : saveAll
};