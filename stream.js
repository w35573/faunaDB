require('dotenv').config({
    path: './config.env'
});

const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET_KEY,
});

//stream all documents present in a collection

const stream = client.stream.document(q.Ref(q.Collection('todos'), '360389966220493402'));

stream.on('start', () => {
    console.log('start');
});

stream.on('snapshot', (event) => {
    console.log('snapshot', event);
});

stream.on('version', (event) => {
    console.log('version', event);
});

stream.on('error', (error) => {
    console.log('error', error.message);
});

stream.on('history_rewrite', () => {
    console.log('history rewrite');
});

stream.start();
