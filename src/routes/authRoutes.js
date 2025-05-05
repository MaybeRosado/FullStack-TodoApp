import express from 'express';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

//Register a new user using the endpoint /auth/register
router.post('/register', (req, res) => {
    const {username, password} = req.body;

    //Encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8)
    
    //Save the new user and hashed password to the db
    try{

        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`);
        const result = insertUser.run(username, hashedPassword);

        //After creating a user, give a default todo
        const defaultTodo = `Hello >.< Add your first todo!`;
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (? , ?)`);
        insertTodo.run(result.lastInsertRowid, defaultTodo);

        //Create a token 
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, {expiresIn: '24h'});
        //Send the token to the client
        res.json({ token });
        
    }catch(err){
        console.log(err);
        res.status(503)
    }
});

router.post('/login', (req, res) => {
    //We get their email and we check the password associated with that email
    //But the password is encrypted, so we need to encrypt the password again
    //and check if it matches the password in the db

    const {username, password} = req.body;

    try{    
        //Check for the user in the db
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
        const user = getUser.get(username);

        //If we dont find a user associated with that username, we send a error
        if(!user){
            res.status(404).send({message: "User not found"})
        }
        
        const passwordIsValuid = bcrypt.compareSync(password, user.password);
        //if the password does not match, we send a error
        if(!passwordIsValuid){
            return res .status(401).send({message:"Invalid password"});
        }
        
        //We have a successful case
        console.log(user)
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "24h"});
        res.json({ token });


    }catch(err){
        console.log(err);
        res.sendStatus(503);
    }

});

export default router;