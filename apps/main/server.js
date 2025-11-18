const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false; // dev mode
const app = next({ dev });
const handle = app.getRequestHandler();

const httpPort = 80; // HTTP port (typically 80)

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        const { pathname, query } = parsedUrl;
        handle(req, res, parsedUrl);
    }).listen(httpPort, (err) => {
        if (err) throw err;
        console.log(`> HTTP server listening on port ${httpPort}`);
    });
});
