const express = require('express');
const path = require('path');
const noteData = require('./db/db.json');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const filePath = './db/db.json';
const PORT = 3001;

const app = express();

app.use(express.static('public'));
app.use(express.json()); // Add this line to parse JSON bodies

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

app.get('/api/notes', (req, res) => res.json(noteData));

app.post('/api/notes', (req, res) => {
  // Read the existing notes from db.json
  fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes from database' });
      return;
    }

    let notes = JSON.parse(data);

    // Create a new note object with a unique ID
    const newNote = {
      id: uuidv4(), // Generate a unique ID
      title: req.body.title,
      text: req.body.text
    };

    // Add the new note to the notes array
    notes.push(newNote);
  
    // Write the updated notes array back to db.json
    fs.writeFile(path.join(__dirname, filePath), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save note to database' });
        return;
      }

      // Send the new note back to the client
      res.json(newNote);
    });
  });
});


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});