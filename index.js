var app = require('express')();
const config = require('config');
var fs = require('fs');
const path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const axios = require('axios');
var fs = require('fs');
var azure = require('azure-storage');
const {SecretClient} = require('@azure/keyvault-secrets');
const {DefaultAzureCredential, ManagedIdentityCredential} = require('@azure/identity');
const { ClientSecretCredential } = require("@azure/identity");
const { v4: uuidv4 } = require('uuid');

var vfilename
var vpatietid



let appport = config.get('app.port');
let tenantId = config.get('azure.devtenantId');
let clientId = config.get('azure.devclientId');
let clientSecret = config.get('azure.devclientSecret');


console.log(`Tenant id : ${tenantId}`);

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

  client.on('patient_no', async function(pno) {
    vpatietid = pno;
    vfilename = vpatietid+'-'+uuidv4()+'.wav';
    console.log(vfilename);
  });

  client.on('message-transcribe', async function(data) {
    // we get the dataURL which was sent from the client
    const dataURL = data.audio.dataURL.split(',').pop();
    // we will convert it to a Buffer
    let fileBuffer = Buffer.from(dataURL, 'base64');
    // run the simple transcribeAudio() function
    console.log('Calling Speach API ');
    

   
    
    // Create the wave file in the local storage
  

      var vdrive = "C:\\"
      var vfolder = "proj"
      //fs.writeFileSync(vfilename, fileBuffer);
      fs.writeFileSync(path.join(vdrive,vfolder,vfilename), fileBuffer);


    
    // Calling the function to retreive the storage connect string stored in azure keyvault secret
    //const stsec = await fetchsecret();
 





  // Upload the audio file to azure storage account  
  // Enter the connect string  nnnnn

  /*  var blobService = azure.createBlobService(stsec);
    blobService.createBlockBlobFromLocalFile('images', vfilename, vfilename, function(error, result, response) {
    if (!error) {
                console.log('File uploaded ');
                fs.unlink(vfilename, function (err) {
                  if (err) throw err;
                  // if no error, file has been deleted successfully
                  console.log('Temp File deleted!');
              });
                }
    });
*/

   // Call Speech to Text API 

  var fname='Can we  opt for online classes';
  var result ='AAA'
  var res;
  axios
  .post('https://prod-81.eastus.logic.azure.com:443/workflows/b807d77ea57847669090f30f68d226a2/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hHbqXcdMS7NToxmUa563AZX1i2jKi9pr4aeBZ0qZJ0I', {
    patientid:vpatietid,fileName:vfilename
  })
  .then(res => {
    client.emit('results', "Hello");
    console.log(`statusCode: ${res.status}`)
    console.log(res.data)
    result = res.data;
    client.emit('results', result);
    

  })
  .catch(error => {
    console.error(error)
  })

  console.log("I am here");



  
const results = "I am here"

    //const results = await transcribeAudio(fileBuffer);
    client.emit('results', results);
});

  client.on('disconnect', () => {
    console.log('user disconnected from the bowser');
  });
});

http.listen(appport, () => {
  console.log(`listening on *:${appport}`);
});



// Function to retreive the storage connect string from the azure keyvault
async function fetchsecret() {
  console.log('Going for Secret');
  const retrievedSecret = await client.getSecret(secretName);
  //console.log(`Your secret value is: ${retrievedSecret.value}`);
  return retrievedSecret.value;
}
