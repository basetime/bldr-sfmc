/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.redirectCode = (req, res) => {
    res.set('Access-Control-Allow-Headers');
    res.set('Access-Control-Allow-Origin', '*');

    try {
        if (!req.query.code) {
            res.status(200);
            res.send('Challenge Code not provided.');
            res.end();
        }

        res.status(200);
        res.send(`
      <!doctype html>
        <html>
        <head>
            <tite>Authorizing BLDR</tite>
        </head>
        <body>
        <p id="message">Authorizing</p>

        <script>
            const params = new URLSearchParams(location.search);
            fetch('http://127.0.0.1:3000/oauth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: params.get('code'),
                }),
            })
                .then((resp) => resp.text())
                .then((text) => {
                    document.querySelector('#message').innerHTML = text;
                });
        </script>
        </body>
        </html>
      `);
        res.end();
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};
