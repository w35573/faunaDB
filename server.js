require('dotenv').config({
    path: './config.env'
});
const express = require('express');
const app = express();
const cors = require('cors')();
const faunadb = require('faunadb');
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET_KEY,
});

// FQL functions
const q = faunadb.query;

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors);

//retrieve all todos
app.get('/todos', async (req, res) => {
    try {
        const getTodos = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('all_todos'))),
                q.Lambda('X', q.Get(q.Var('X')))
            )
        );

        res.status(200).json({
            success: true,
            data: getTodos
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//retrieve all completed todos
app.get('/todos/completed_todos', async (req, res) => {
    try {
        const getTodos = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('completed_todo'), true)),
                q.Lambda('X', q.Get(q.Var('X')))
            )
        );

        res.status(200).json({
            success: true,
            data: getTodos
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//retrieve all todos sorted by date
app.get('/todos/sorted', async (req, res) => {
    try {
        const getSortedTodos = await client.query(
            q.Paginate(q.Match(q.Index('todos_by_date_desc')))
        );

        res.status(200).json({
            success: true,
            data: getSortedTodos
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//retrieve a single todo by specifying id
app.get('/todos/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'Missing ID' });
        }

        const { data } = await client.query(
            q.Get(q.Ref(q.Collection('todos'), req.params.id))
        );
        res.status(200).json({
            success: true,
            data: data
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//create a todo
app.post('/todos', async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        //completed is boolean value

        if (!title || !description) {
            return res.status(400).json({ error: 'Missing title or description' });
        }

        //save date at which event created
        const date = new Date().toISOString();

        const { data } = await client.query(
            q.Create(q.Collection('todos'), { data: { title, description, completed, date } })
        );

        res.status(201).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update a todo by specifying id
app.put('/todos/:id', async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Missing title or description' });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: 'Missing ID' });
        }

        const { data } = await client.query(
            q.Update(q.Ref(q.Collection('todos'), req.params.id),
                { data: { title, description } },
            )
        );

        res.status(201).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//delete a todo by specifying id
app.delete('/todos/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'Missing ID' });
        }

        const { data } = await client.query(
            q.Delete(q.Ref(q.Collection('todos'), req.params.id))
        );

        console.log(data);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

