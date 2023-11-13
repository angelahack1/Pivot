import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import moment from 'moment';
import bodyParser from 'body-parser';

const testing = process.env.TESTING;
const log_level = process.env.LEVEL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

var port = 5555;

if(testing === 1) {
    port = 5555;
} else {
    port = 80;
}

async function run(dateArg, timeArg, emailArg, commentArg, ipArg) {
 const uri = "mongodb://angelalm:1164Louder@127.0.0.1:27017/artecnologia_db?retryWrites=true&w=majority";
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

app.use(express.static(path.join(__dirname, './')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/contact_form', (req, res) => {
    const email = req.body.email;
    const comment = req.body.comment;
    var ip = req.ip;
    console.log('Req received from:',ip,' posting: ', req.body);
    var currentDate = moment().format('YYYY/MM/DD');
    var currentTime = moment().format('HH:mm:ss');
    run(currentDate, currentTime, email, comment, ip).catch(console.log);
    res.redirect('http://aixkare.com/thanks.html');
});

app.get('/contact_form', (req, res) => {
    var email = req.query.email;
    var comment = req.query.comment;
    var ip = req.ip;
    console.log('Req received from:', ip, ' getting: (', email,' ', comment, ')');
    var currentDate = moment().format('YYYY/MM/DD');
    var currentTime = moment().format('HH:mm:ss');
    run(currentDate, currentTime, email, comment, ip).catch(console.log);
    res.redirect('http://aixkare.com/thanks.html');
});

app.listen(port, function() {
    console.log('Testing: ', testing);
    console.log('Log Level: ', log_level);
    console.log('Server is running on port: ', port);
});
