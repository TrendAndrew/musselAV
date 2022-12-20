
# @anamico/musselav

![musselAV](https://github.com/TrendAndrew/musselav/blob/main/img/musselAV.png)

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

Obviously should run your resulting server with pm2 or something similar to make sure it's always up and running.
Should work fine in a cluster behind a session aware load balancer for servicing a lot of requests.

Note that clamAV has a standard max file size, and even by configuration it cannot get above 4Gb, so probably do the same check on your end if you want to remain functionally identical. Or use bigger files if you can handle them.

## example

In the example folder, there is an example server and an example client that will submit a file to the server.

```bash
cd example

# start the example server
node exampleServer.js

# and run the client in a different terminal
node exampleClient.js
```

The example server is just doing a basic "echo" response that reports a virus on any file you submit. You need to implement the routing to a different AV scanner, sandbox or whatever you are using to implement the AV scan.

## used by

<a href="https://github.com/TrendAndrew/TrendyClam" target="_blank">TrendyClam</a> - A drop in replacement for clamAV to use Trend Micro enterprise strength scanning instead. Using this library it just masquerades as a clamAV server for simple swap and replacement with no other changes.