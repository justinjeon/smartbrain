const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let currId = 3;
 
const database = {
	users: [
		{
			id: '1',
			name: 'james',
			email: 'james@gmail.com',
			password: 'james123',
			entries: 0,
			joined: new Date(),
		},
		{
			id: '2',
			name: 'Megan',
			email: 'megan@gmail.com',
			password: 'megan123',
			entries: 0,
			joined: new Date(),
		}
	],
	login: [
		{
			id: '987',
			hash: '',
			email: 'john@gmail.com'
		}
	]
}

app.get('/', (req, res) =>{
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	if (req.body.email === database.users[0].email 
		&& req.body.password === database.users[0].password) {
		res.json(database.users[0]);
	} else {
		res.status(400).json("Error logging in");
	}
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;


	database.users.push({
			id: String(currId++),
			name: name,
			email: email,
			entries: 0,
			joined: new Date(),
	})
	res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) =>{
	const { id } = req.params;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id)
		{
			res.json(user);
			found = true;
		}
	})

	if (!found)
		res.status(404).json("no such user");
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id)
		{
			user.entries++;
			res.json(user.entries);
			found = true;
		}
	})

	if (!found)
		res.status(404).json("no such user");
})





app.listen(3000, () => {
	console.log("server is up!");
});

