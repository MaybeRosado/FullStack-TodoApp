import expres from 'express';
import db  from '../db.js';

const router = expres.Router();

//Get todos of a user
router.get('/', (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`);
    const todos = getTodos.all(req.userId);
    res.json(todos);

});

//Create a new todo
router.post('/', (req, res) => {

});

//Update a todo
router.put('/:id', (req, res) => {

});

//Delete a todo
router.delete('/:id', (req, res) => {

});

export default router;