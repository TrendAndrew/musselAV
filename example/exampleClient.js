const clamd = require('clamdjs');
const scanner = clamd.createScanner('127.0.0.1', 3310);

scanner.scanFile('test.txt', 3000, 1024 * 1024)
    .then((reply) => {
        console.log('reply: ', reply);
        // print some thing like
        // 'stream: OK', if not infected
        // `stream: ${virus} FOUND`, if infected
    })
    .catch((error) => {
        console.error('error: ', error);
    });