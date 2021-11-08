const { response } = require('express');
const express = require('express');
const http = require("http");
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const socetIO = require("socket.io");
const bodyParser = require('body-parser');


const app = express();
const server = http.createServer(app);
const io = socetIO(server);
app.use(bodyParser.urlencoded({ extended: false }));

const questions = [
    {
        question: 'what is the capital of California?',
        answer: 'Sacramento',
        winner: '',
        answered: false
    },
];

let currQuestion = 0;

io.on("connection", () => {
    console.log("user is connected");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.post("/welcome", (req, res) => {
    const number = req.query.number;
    const client = require('twilio')(accountSID, authToken);

    return client.messages
    .create({
        body: 'Ahoy! Welcome to the Ibums Twilio SMS game!',
        from: '+12566744610',
        to: number
    }).then((message) =>{
        res.json(message);
    });
});

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    const body = req.body.Body;
    if(body == questions[currQuestion].answer){
        if(!questions[currQuestion].answered){
            questions[currQuestion].answered = true;
            twiml.message('Correct!');
            io.emit("answer-received", req.body.From);
        } else {
            twiml.message('Gotta be quicker than that!');
        }
    } else {
        twiml.message('Sorry dude. Youre wrong!');
    }
    res.writeHead(200, {'Content-Type' : 'text/xml'});
    res.end(twiml.toString());
});

server.listen(1337, () => {
    console.log("server is up and running on port 1337");
    console.log(__dirname);
});