import express from 'express';
import { MongoClient } from 'mongodb';
import moment from 'moment';
import bodyParser from 'body-parser';
import { readFile } from 'node:fs';

const testing = process.env.TESTING;
const log_level = process.env.LEVEL;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 5555;

if(testing === 1) {
    port = 5555;
} else {
    port = 80;
}

async function sendToMongo(uri, dateArg, timeArg, emailArg, commentArg, ipArg) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const collection = client.db("artecnologia_db").collection("req_for_comments");
        const document = { date: dateArg, time: timeArg, email: emailArg, comment: commentArg, ip: ipArg }
        console.log('About to insert to db this document: ', document); 
        const result = await collection.insertOne(document);
        console.log('Document inserted successfully:', result);
    } catch (error) {
        console.log('Error inserting document:', error);
    } finally {
        await client.close();
    }

}

async function run(dateArg, timeArg, emailArg, commentArg, ipArg) {
    var uri = null;
    console.log('About to read from credentials...');
    readFile('./credentials.dat', {encoding: 'utf8'}, (err, data) => {
        if (err) {
            console.log('Cannot read credentials to connect to mongodb', err);
            return;
        } else {
            uri = data;
            console.log('URI loaded to connecto to mongodb: ', uri);
            sendToMongo(uri, dateArg, timeArg, emailArg, commentArg, ipArg).catch(console.log);
        }
    });
}

app.post('/contact_form', (req, res) => {
    const email = req.body.email;
    const comment = req.body.comment;
    console.log('Req for comment received with: Email: <', email, '>, Comment: <', comment,'>');
    if (typeof email === 'undefined' || email === null || typeof comment === 'undefined' || comment === null) {
        console.log('Parameters are incorrect: email: ', email, ' comment: ', comment);
        res.redirect('http://aixkare.com/thanks.html');
    } else {
        var ip = req.ip;
        console.log('Req received from:',ip,' posting: ', req.body);
        var currentDate = moment().format('YYYY/MM/DD');
        var currentTime = moment().format('HH:mm:ss');
        run(currentDate, currentTime, email, comment, ip).catch(console.log);
        res.redirect('http://aixkare.com/thanks.html');
    }
});

app.get('/contact_form', (req, res) => {
    const email = req.query.email;
    const comment = req.query.comment;
    console.log('Req for comment received with: Email: <', email, '>, Comment: <', comment,'>');
    if (typeof email === 'undefined' || email === null || typeof comment === 'undefined' || comment === null) {
        console.log('Parameters are incorrect: email: ', email, ' comment: ', comment);
        res.redirect('http://aixkare.com/thanks.html');
    } else {
        var ip = req.ip;
        console.log('Req received from:',ip,' posting: ', req.body);
        var currentDate = moment().format('YYYY/MM/DD');
        var currentTime = moment().format('HH:mm:ss');
        run(currentDate, currentTime, email, comment, ip).catch(console.log);
        res.redirect('http://aixkare.com/thanks.html');
    }
});

app.listen(port, function() {
    console.log('Testing: ', testing);
    console.log('Log Level: ', log_level);
    console.log('Server is running on port: ', port);
});
