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
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes from database' });
    }

    const updatedNotes = JSON.parse(data);
    res.json(updatedNotes);
  });
});

app.post('/api/notes', (req, res) => {
  if (!req.body.title || !req.body.text) {
    return res.status(400).json({ error: 'Title and/or text missing in request body' });
  }

  fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes from database' });
    }

    let notes = JSON.parse(data);

    const newNote = {
      id: uuidv4(), // Generate a unique ID
      title: req.body.title,
      text: req.body.text
    };

    notes.push(newNote);

    fs.writeFile(path.join(__dirname, filePath), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note to database' });
      }

      // Read the updated db.json file to get the new list of notes
      fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to read notes from database' });
        }

        const updatedNotes = JSON.parse(data);
        res.json(updatedNotes);
      });
    });
  });
});
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes from database' });
      return;
    }

    let notes = JSON.parse(data);

    const noteIndex = notes.findIndex(note => note.id === noteId);

    if (noteIndex === -1) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }


    const deletedNote = notes.splice(noteIndex, 1)[0];

    fs.writeFile(path.join(__dirname, filePath), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete note from database' });
        return;
      }

      res.json(deletedNote);
    });
   
 }); 
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});