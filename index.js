var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var azure = require('azure-storage');

app.get('/', (req, res) => {
//  res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/audiorec.html');
});

//io.on('connection', (socket) => {
 // console.log('a user connected from browser');
  io.on('connect', (client) => {
    console.log(`Client connected [id=${client.id}]`);
    client.emit('server_setup', `Server connected [id=${client.id}]`);

  client.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

  client.on('message-transcribe', async function(data) {
    // we get the dataURL which was sent from the client
    const dataURL = data.audio.dataURL.split(',').pop();
    // we will convert it to a Buffer
    let fileBuffer = Buffer.from(dataURL, 'base64');
    // run the simple transcribeAudio() function
    console.log('Calling Speach API ');
    

    
    fs.writeFileSync('test.wav', fileBuffer);

  // Upload the audio file to azure storage account  
  // Enter the connect string
    var blobService = azure.createBlobService("DefaultEndpointsProtocol=https;AccountName=storagexxxxxxxxxxxxxxxxx");
    blobService.createBlockBlobFromLocalFile('images', 'testinazure.wav', 'test.wav', function(error, result, response) {
    if (!error) {
    console.log('File uploaded ');
    }
});

    //const results = await transcribeAudio(fileBuffer);
    //client.emit('results', results);
});

  client.on('disconnect', () => {
    console.log('user disconnected from the bowser');
  });
});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
