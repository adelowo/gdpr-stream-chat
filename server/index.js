// 2 api routes
// 1 - auth : logins or create a new user. Make sure to accept email
// 2 - export chat; Protect, accept user's ID
const express = require('express');
const StreamChat = require('stream-chat').StreamChat;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const omit = require('lodash.omit');
const bcrypt = require('bcryptjs')

const User = require('./models');

dotenv.config();

const port = process.env.PORT || 5200;


mongoose.promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', err => {
	console.error(err);
});

db.on('disconnected', () => {
	console.info('Database disconnected!');
});

process.on('SIGINT', () => {
	mongoose.connection.close(() => {
		process.exit(0);
	});
});

const app = express();
app.use(express.json());

const client = new StreamChat(process.env.API_KEY, process.env.API_SECRET);

const channel = client.channel('messaging', 'chat-export', {});

app.post('/users/auth', async (req, res) => {
    const apiKey = process.env.API_KEY

    const {
        username,
        password
    } = req.body;

    if (username === undefined || username.length == 0) {
        res.status(400).send({
            status: false,
            message: 'Please provide your username',
        });
        return;
    }

    if (password === undefined || password.length == 0) {
        res.status(400).send({
            status: false,
            message: 'Please provide your password',
        });
        return;
    }

    let user = await User.findOne({
            username: username.toLowerCase()
        }
    );

    if (!user) {
        let user = await User.create({
            username: username,
            password: password,
        });

        user = omit(user._doc, ['__v', 'createdAt', 'updatedAt']); // and remove data we don't need with the lodash omit

        const token = client.createToken(user._id.toString());

        await client.updateUsers([{
            id: user._id,
            role: 'channel_member',
        }, ]);

        await channel.addMembers([user._id]);

        delete user.password;

        res.json({
            status: true,
            user,
            token,
            apiKey
        });
        return
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        res.status(403);
        res.json({message:'Password does not match', status: false})
        return
    }

    // generate token using the unique database id
    const token = client.createToken(user._id.toString());

    user = omit(user._doc, ['__v', 'createdAt', 'updatedAt']);

    delete user.password;

    res.json({
        status:true,
        user,
        token,
        apiKey
    });

});

// app.post('/users/add_member', (req, res) => {
//   const username = req.body.username;

//   if (username === undefined || username.length == 0) {
//     res.status(400).send({
//       status: false,
//       message: 'Please provide your username',
//     });
//     return;
//   }

//   channel
//     .addMembers([username])
//     .then(() => {
//       res.status(200).send({ status: true });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(200).send({ status: false });
//     });
// });

app.listen(port, () => console.log(`App listening on port ${port}!`))