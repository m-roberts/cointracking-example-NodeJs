# CoinTracking fetch

NodeJS project which will grab all possible information from the CoinTracking API and save it into JSON files.

Click [here](https://cointracking.info/api/api.php) to see the official API documentation.
This implementation currently specifies no parameters with each API call.

## Running this application

Create an 'api.key' JSON file in the root directory, with "key" and "secret" properties representing your CoinTracking API key information.

```bash
npm install
npm start
```

## REMINDER:

In most situations one call per hour is enough.

	Maximum API requests:
	- FREE users: No API access yet
	- PRO users: 20 calls per hour
	- UNLIMITED users: 60 calls per hour

Do not exceed these usage limits.