

'use strict';
const Alexa = require('alexa-sdk');
var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "ActivityTable";
//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb______...';
const APP_ID = undefined;

const SKILL_NAME = 'activity tracker';
const GET_FACT_MESSAGE = "Here's your fact: ";
const HELP_MESSAGE = 'Help Message';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },
    'AddActivityIntent': function () {
        // const factArr = data;
        // const factIndex = Math.floor(Math.random() * factArr.length);
        // const randomFact = factArr[factIndex];
        // const speechOutput = GET_FACT_MESSAGE + randomFact;

        // this.response.cardRenderer(SKILL_NAME, randomFact);
        // this.response.speak(speechOutput);
        // this.emit(':responseReady');
        let self = Alexa.Handler = this;
        let intentRequest = self.event.request;
        let ActivitySlotVal = intentRequest.intent.slots.ActivitySlot.value
        let str = this.event.request.intent.slots.ActivitySlot.value;
        //var ActivitySlotVal = Alexa.Handler.event.request.intent.slots.ActivitySlot.value

        var params = {
            TableName:table,
            Item:{
                "ActivityKey": ActivitySlotVal + "",
                "Time": 1,
            }
        };

        console.log("Adding a new item...");
        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });

        this.response.speak("Added " + ActivitySlotVal + " activity.");
        this.emit(':responseReady');

    },
    'GetActivityIntent': function () {
        var DebugCount = 0;
        var DBItems = [];
        var DBItemsString = "";
        var params = {
            TableName:table,
            S: "ActivityKey"
            };
        docClient.scan(params, function(err, data) {
            DBItemsString = "There are currently no activities.";
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                DBItemsString = "Something went wrong with fetching your activities";
            } else {
                DBItemsString = "Processing Activities";
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                // let Arr = data;
                // console.log(Arr);
                console.log("Scan succeeded.");
                data.Items.forEach(function(itemdata) {
                    //console.log("Item :", ++DebugCount,JSON.stringify(itemdata.ActivityKey));
                    DBItems.push(itemdata.ActivityKey + " at " + itemdata.Time);
                });
                DBItemsString = DBItems.join(', ');
                console.log(DBItemsString);
            }
        });
        this.response.speak(DBItemsString);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.FallbackInten': function () {
        this.response.speak("Activity tracker is a bit confused");
        this.emit(':responseReady');
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
