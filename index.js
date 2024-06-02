require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.DATABASE).then(() => {
    console.log('Mongodb connected!')
}).catch((err) => {
    console.error(err);
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(password, salt, async(err, hash) => {
            const newUser = new User({
                username: username,
                password: hash,
                role: 'admin'
            });
            await newUser.save()
        })
    })

    res.status(200).json(req.body);
});

app.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username: username});
    bcrypt.compare(password,user.password,(err,result)=>{
        if (result){
            res.status(200).json(user);
        }else{
            res.status(404).json('Username or password is incorrect!');
        }
    })
})

const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}.`)
});