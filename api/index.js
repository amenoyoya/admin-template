// load .env file
require('dotenv').config();

// import fastify & mongoose
const fastify = require('fastify');
const mongoose = require('mongoose');
const noteRoutes = require('./routes/noteRoutes');
const contentRangeHook = require('./hooks/contentRangeHook');

// initialized Fastify App
const app = fastify();

// connected fastify to mongoose
try {
  mongoose.connect(`mongodb://localhost:${process.env.MONGO_PORT}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASSWORD,
    dbName: 'notes_db',
  });
} catch (e) {
  console.error(e);
}

// add `Content-Range` header
app.addHook('preHandler', contentRangeHook);

// define `notes` route
noteRoutes(app);

// handle root route
app.get('/', (request, reply) => {
  try{
    reply.send("Hello world!");
  } catch(e) {
    console.error(e);
  }
})

// set application listening on port 5000 of localhost
app.listen(5000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on ${address}`);
});