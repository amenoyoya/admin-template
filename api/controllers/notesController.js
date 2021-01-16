const Note = require('../models/Note');

module.exports = {
  // create a note
  create: async (request, reply) => {
    try {
      const newNote = await Note.create(request.body);
      reply.code(201).send(newNote);
    } catch (e) {
      reply.code(500).send(e);
    }
  },
  
  // get the list of notes
  fetch: async (request, reply) => {
    try {
      const notes = await Note.find({});
      reply.code(200).send(notes);
    } catch (e) {
      reply.code(500).send(e);
    }
  },
  
  // get a note
  get: async (request, reply) => {
    try {
      const note = await Note.findById(request.params.id);
      reply.code(200).send(note);
    } catch (e) {
      reply.code(500).send(e);
    }
  },
  
  // update a note
  update: async (request, reply) => {
    try {
      const noteId = request.params.id;
      await Note.findByIdAndUpdate(noteId, request.body);
      
      const updatedNote = await Note.findById();
      reply.code(200).send({data: updatedNote});
    } catch (e) {
      reply.code(500).send(e);
    }
  },
  
  // delete a note
  delete: async (request, reply) => {
    try {
      const noteId = request.params.id;
      const deleteToNote = await Note.findById(noteId);
      await Note.findByIdAndDelete(noteId);
      reply.code(200).send({data: deleteToNote});
    } catch (e) {
      reply.code(500).send(e);
    }
  },
};