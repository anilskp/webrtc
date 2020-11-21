var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var azure = require('azure-storage');
const {SecretClient} = require('@azure/keyvault-secrets');
const {DefaultAzureCredential, ManagedIdentityCredential} = require('@azure/identity');
const { ClientSecretCredential } = require("@azure/identity");

var tenantId = "a4a1ba9b-8ece-4448-a5dc-d891fad077a3";
var clientId = "e652b0c8-603e-4314-a46d-4f938b69f471";
var clientSecret = "c-AYPWPG637.bHxT526vK~Lpyf6Y3~5zQF";

//const credential = new ManagedIdentityCredential();
//const credential = new DefaultAzureCredential();
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

// Replace value with your Key Vault name here
const vaultName = "sttkeys-kv";
const url = `https://${vaultName}.vault.azure.net`;
  
const client = new SecretClient(url, credential);

// Replace value with your secret name here
const secretName = "storagekey";



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
    

    // Create the wave file in the local storage
      fs.writeFileSync('test.wav', fileBuffer);

    
    
    // Calling the function to retreive the storage connect string stored in azure keyvault secret
    const stsec = await fetchsecret();
 





  // Upload the audio file to azure storage account  
  // Enter the connect string  nnnnn
    var blobService = azure.createBlobService(stsec);
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

// Function to retreive the storage connect string from the azure keyvault
async function fetchsecret() {
  console.log('Going for Secret');
  const retrievedSecret = await client.getSecret(secretName);
  //console.log(`Your secret value is: ${retrievedSecret.value}`);
  return retrievedSecret.value;
}
