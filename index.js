const net = require('net');
const uuid = require('uuid').v4;

const terminator = Buffer.from(new Uint8Array([0,0,0,0]));

console.log('test: ', terminator);

const newServer = ({ port, sessionHandler, dataHandler, endHandler }) => {

    const server = net.createServer({
        allowHalfOpen: true           // need to be able to respond after the client finishes sending
    }, function(socket) {

        var firstChunk = true;
        var isSize = true;
        const socketId = uuid();
        socket.id = socketId;

        // notify new connection
        sessionHandler && sessionHandler(socket);

        // handle this connection
        socket.on('readable', async () => {
            let chunk;
            while (null !== (chunk = socket.read())) {
                // handle initial chunks
                if (firstChunk && (chunk.toString() === 'zINSTREAM\0')) {
                    firstChunk = false;
                } else {
                    // drop size packets
                    // todo: follow the spec and use the size to determine the chunk boundaries
                    if (isSize) {
                        isSize = false; // next is data
                        console.log('data size = ', chunk);
                        // handle end of data
                        if (!Buffer.compare(chunk, terminator)) {
                            console.log('cool!', chunk);
                            await endHandler(socket);
                            socket.end();
                        }
                    } else {
                        isSize = true; // next is another size packet
                        // forward this chunk, it's real data
                        console.log('data chunk:', chunk);
                        await dataHandler(socket, chunk);
                    }
                }
                // todo: handle backpressure - maybe this is already handled?
                
            }
        });
    
        socket.on('end', async () => {
            console.log('socket ended');
            //await endHandler(socket);
            //socket.pipe(socket);
            //endHandler(socket);
            // return {
            //     name: upload.name,
            //     is_infected: result.isInfected,
            //     viruses: result.viruses,
            //   };
        });

        socket.respond = async (data) => {
            socket.write(JSON.stringify(data, null, 2));
        }
    });

    const start = async () => {
        const actualPort = port || 3310;
        server.listen(actualPort, '127.0.0.1');
        return { port: actualPort };
    };

    return {
        start: start
    };
}

module.exports = {
    newServer: newServer
};