import express from 'express';
import { generate } from './utils.js';

let app = express();

app.get('/', async (req, res) => {
    res.send(await generate());
});

app.listen(8080, () => console.log('Example app listening on port 8080!'));