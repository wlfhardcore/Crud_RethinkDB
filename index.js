const express = require('express');
const r = require('rethinkdb');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

const dbConfig = {
    host: 'localhost',
    port: 28015,
    db: 'tasks_db'
};

let connection = null;
r.connect(dbConfig, (err, conn) => {
    if (err) throw err;
    connection = conn;
    r.dbList().contains('tasks_db')
        .do(databaseExists => r.branch(
            databaseExists,
            { dbs_created: 0 },
            r.dbCreate('tasks_db')
        )).run(connection, (err, result) => {
            if (err) throw err;
            r.db('tasks_db').tableList().contains('tasks')
                .do(tableExists => r.branch(
                    tableExists,
                    { tables_created: 0 },
                    r.db('tasks_db').tableCreate('tasks')
                )).run(connection, (err, result) => {
                    if (err) throw err;
                });
        });
});

app.get('/tasks', (req, res) => {
    r.table('tasks').run(connection, (err, cursor) => {
        if (err) throw err;
        cursor.toArray((err, result) => {
            if (err) throw err;
            res.json(result);
        });
    });
});

app.post('/tasks', (req, res) => {
    const task = req.body;
    r.table('tasks').insert(task).run(connection, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.put('/tasks/:id', (req, res) => {
    const task = req.body;
    const taskId = req.params.id;
    r.table('tasks').get(taskId).update(task).run(connection, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    r.table('tasks').get(taskId).delete().run(connection, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
