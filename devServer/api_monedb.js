const MoneDB = require('./lib/monedb');
const rison = require('rison');

module.exports = async (fastify, opts) => {
  const id_format = process.env.MONEDB_ID_FORMAT || 'number';
  const client = new MoneDB(process.env.MONEDB_URL || `${__dirname}/nedb`, id_format);
  await client.connect();

  const db = client.db(process.env.MONEDB_DATABASE || 'mone');

  /**
   * Convert Object ID type, according to the `ID Format`
   * @param {number|string} id
   * @return {number|string}
   */
  function objectId(id) {
    if (id_format === 'number') {
      return parseInt(id, 10);
    }
    return id.toString();
  }

  /**
   * GET /api/monedb/${collection}?${rison_query}
   * @description Find a list of data
   * @param {string} collection data resource name
   * @param {string?} rison_query search query formatted by https://rison.io
   *    @example {pagination:{page:1, perPage:50}, sort:{field:'created_at', order:'DESC'}, filter:{$or:{created_at:{$gt:'1980-01-01'}, updated_at:{$exists:true}}}}
   *      => (pagination:(page:1, perPage:50), sort:(field:'created_at', order:'DESC'), filter:('$or':(created_at:('$gt':'1980-01-01'), updated_at:('$exists':!t))))
   * @return {object[]}
   */
  fastify.get('/:collection', async (request, reply) => {
    try {
      let query = request.raw.url.split('?').slice(1).join('');
      query = rison.decode(query || '()');
      
      const paginator = {};
      const data = await db.collection(request.params.collection).find(query, paginator);
      reply
        .header('Content-Range', `${request.params.collection} ${paginator.skip}-${paginator.skip + paginator.perPage - 1}/${paginator.count}`)
        .send(data);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * POST /api/monedb/${collection}
   * @description Create a single, or list of data
   * @param {object} payload {data: {object|object[]: data for create}}
   * @return {object[]} created data list
   */
   fastify.post('/:collection', async (request, reply) => {
    try {
      if (typeof(request.body.data) !== 'object') {
        return reply.code(400).send({error: 'payload.data must be a single, or list of object(s)'});
      }
      reply.send(await db.collection(request.params.collection).insert(request.body.data));
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * PUT /api/monedb/${collection}
   * @description Update a list of data
   * @param {object} payload {filter: {object: query for updating data}, data: {$set: {object: updating data}}}
   * @return {object[]} previous data list
   */
   fastify.put('/:collection', async (request, reply) => {
    try {
      if (typeof(request.body.filter) !== 'object') {
        return reply.code(400).send({error: 'payload.filter must be a object'});
      }
      if (typeof(request.body.data) !== 'object') {
        return reply.code(400).send({error: 'payload.data must be a object'});
      }
      const collection = db.collection(request.params.collection);
      const prevData = await collection.find({filter: request.body.filter});
      const updated = await collection.update(request.body.filter, request.body.data);
      if (updated < prevData.length) {
        throw new Error('A part of data may not be updated');
      }
      reply.send(prevData);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * DELETE /api/monedb/${collection}
   * @description Delete a list of data
   * @param {object} payload {filter: {object: query for deleting data}}
   * @return {object[]} previous data list
   */
   fastify.delete('/:collection', async (request, reply) => {
    try {
      if (typeof(request.body.filter) !== 'object') {
        return reply.code(400).send({error: 'payload.filter must be a object'});
      }
      const collection = db.collection(request.params.collection);
      const prevData = await collection.find({filter: request.body.filter});
      const deleted = await collection.delete(request.body.filter);
      if (deleted < prevData) {
        throw new Error('A part of data may not be deleted');
      }
      reply.send(prevData);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * GET /api/monedb/${collection}/${id}
   * @description Find a single data by ID
   * @param {string} collection data resource name
   * @param {number|string} id target data id
   * @return {object}
   */
  fastify.get('/:collection/:id', async (request, reply) => {
    try {
      const data = await db.collection(request.params.collection).find({
        pagination: {page: 1, perPage: 1}, filter: {_id: objectId(request.params.id)}
      });
      if (data.length === 0) {
        return reply.code(404).send({error: `Resource ID: ${request.params.id} not found`});
      }
      reply.send(data[0]);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * PUT /api/monedb/${collection}/${id}
   * @description Update a single data by ID
   * @param {string} collection data resource name
   * @param {number|string} id target data id
   * @param {object} payload {data: {$set: {object: updating data}}}
   * @return {object} previous data
   */
   fastify.put('/:collection/:id', async (request, reply) => {
    try {
      if (typeof(request.body.data) !== 'object') {
        return reply.code(400).send({error: 'payload.data must be a object'});
      }
      
      const collection = db.collection(request.params.collection);
      const filter = {_id: objectId(request.params.id)};
      const prevData = await collection.find({filter});
      if (prevData.length === 0) {
        return reply.code(404).send({error: `Resource ID: ${request.params.id} not found`});
      }

      const updated = await collection.update(filter, request.body.data);
      if (updated < prevData.length) {
        throw new Error('A part of data may not be updated');
      }
      reply.send(prevData[0]);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });

  /**
   * DELETE /api/monedb/${collection}/${id}
   * @description Delete a single data by ID
   * @param {string} collection data resource name
   * @param {number|string} id target data id
   * @return {object} previous data
   */
   fastify.delete('/:collection/:id', async (request, reply) => {
    try {
      const collection = db.collection(request.params.collection);
      const filter = {_id: objectId(request.params.id)};
      const prevData = await collection.find({filter});
      if (prevData.length === 0) {
        return reply.code(404).send({error: `Resource ID: ${request.params.id} not found`});
      }

      const deleted = await collection.delete(filter);
      if (deleted < prevData.length) {
        throw new Error('A part of data may not be deleted');
      }
      reply.send(prevData[0]);
    } catch (err) {
      reply.code(500).send({error: process.env.DEBUG === 'true'? err.stack: err.toString()});
    }
  });
};