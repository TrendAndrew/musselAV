
# @anamico/musselav

![musselAV](img/musselAV.png)

## What is it?

musselAV is a simple javascript clamAV server emulator library.

It's been designed to essentially impersonate a clamAV TCP server for simple file submission for AV Scanning.

## usage

add the library

```bash
npm i --save @anamico/musselav
```

then utilise the server component in your code

```js
const musselAV = require('@anamico/musselav');

const customAVScanner = new /*<your custom scanner>*/;

const dataHandler = async (session, chunk) => {
    // handle each chunk of file data as it is received.
    // Recommend just piping it through to your backend process
    // rather than assembling and staging the whole file.
    // eg:
    customAVScanner.addChunk(chunk);
};

const endHandler = async (session) => {
    // process the file, get your answer and then respond to the caller
    const result = await customAVScanner.getResult(); // or whatever you need to call

    // via musselAV
    const response = {
        is_infected: result.isInfected,
        viruses: result.viruses
    }
    // this will automatically stringify the json response
    session.respond(response);
};

const server = musselAV.newServer({
    // port: 3310,              // default
    // sessionHandler: null,    // default
    dataHandler: dataHandler,
    endHandler: endHandler
});

server.start().then(({ port }) => {
    console.log('example MusselAV server running on localhost:3310');
});
```

## example

There is an example server and an example client that will submit a file to the server.

The example server is just doing a basic "echo" response that reports a virus on any file you submit. You need to implement the routing to a different AV scanner, sandbox or whatever you are using to implement the AV scan.