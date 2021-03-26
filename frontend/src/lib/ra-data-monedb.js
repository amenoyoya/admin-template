import { fetchUtils } from 'react-admin';
import rison from 'rison';

const apiUrl = 'http://localhost:5080/api/monedb';
const httpClient = fetchUtils.fetchJson;

export default {
  /**
   * Search for resources
   * @param {string} resource 
   * @param {object} params {pagination: {page: int, perPage: int}, sort: {field: string, order: string}, filter: {*}}
   * @return {object} {data: object[], total: int}
   */
  getList: (resource, params) => {
    const url = `${apiUrl}/${resource}?${rison.encode(params)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json.map((resource) => ({ ...resource, id: resource._id })),
      total: parseInt(headers.get('content-range').split('/').pop(), 10),
    }));
  },

  /**
   * Read a single resource, by id
   * @param {string} resource 
   * @param {object} params {id: int|string}
   * @return {object} {data: object}
   */
  getOne: (resource, params) => (
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: { ...json, id: json._id },
    }))
  ),

  /**
   * Read a list of resource, by ids
   * @param {string} resource 
   * @param {object} params {ids: int[]|string[]}
   * @return {object} {data: object[]}
   */
  getMany: (resource, params) => {
    const query = {
      filter: {_id: {$in: params.ids}},
    };
    const url = `${apiUrl}/${resource}?${rison.encode(query)}`;
    return httpClient(url).then(({ json }) => ({
      data: json.map((resource) => ({ ...resource, id: resource._id })),
    }));
  },

  /**
   * Read a list of resources related to another one
   * @param {string} resource 
   * @param {object} params {target: string, id: int|string, pagination: {page: int, perPage: int}, sort: {field: string, order: string}, filter: {*}}
   * @return {object} {data: object[], total: int}
   */
  getManyReference: (resource, params) => {
    const query = {};
    if (params.pagination) query.pagination = params.pagination;
    if (params.sort) query.sort = params.sort;
    query.filter = {
      ...(params.filter || {}),
      [params.target]: params.id,
    };
    const url = `${apiUrl}/${resource}?${rison.encode(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json.map((resource) => ({ ...resource, id: resource._id })),
      total: parseInt(headers.get('content-range').split('/').pop(), 10),
    }));
  },

  /**
   * Create a single resource
   * @param {string} resource 
   * @param {object} params {data: {*}}
   * @return {object} created data
   */
  create: (resource, params) => (
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify({
        data: params.data
      }),
    }).then(({ json }) => ({
      data: { ...json[0].data, id: json[0]._id },
    }))
  ),

  /**
   * Update a single resource
   * @param {string} resource 
   * @param {object} params {id: int|string, data: {*}, previousData: {*}}
   * @return {object} previous data
   */
  update: (resource, params) => (
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {$set: params.data}
      }),
    }).then(({ json }) => ({ ...json, id: json._id }))
  ),

  /**
   * Update multiple resources
   * @param {string} resource 
   * @param {object} params {ids: int[]|string[], data: {*}}
   * @return {object} {data: string[] *previous data list}
   */
  updateMany: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}`, {
      method: 'PUT',
      body: JSON.stringify({
        filter: {_id: {$in: params.ids}},
        data: {$set: params.data}
      }),
    }).then(({ json }) => ({ data: json }));
  },

  /**
   * Delete a single resource
   * @param {string} resource 
   * @param {object} params {id: int|string, previousData: {*}}
   * @return {object} previous data
   */
  delete: (resource, params) => (
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE'
    }).then(({ json }) => ({ ...json, id: json._id }))
  ),

  /**
   * Delete multiple resources
   * @param {string} resource 
   * @param {object} params {ids: int[]|string[]}
   * @return {object} {data: object[] *previous data list}
   */
  deleteMany: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}`, {
      method: 'DELETE',
      body: JSON.stringify({
        filter: {_id: {$in: params.ids}}
      }),
    }).then(({ json }) => ({ data: json }));
  },
};