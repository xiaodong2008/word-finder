import { request } from "./";

// api /api/dictionary/count

// Method: GET
// Path: /api/dictionary/count
// Data: { }

export function count() {
  return request('/api/dictionary/count', {})
}

// api /api/dictionary/get

// Method: GET
// Path: /api/dictionary/get
// Data: { page }

export function get(page) {
  return request('/api/dictionary/get', { page })
}

// api /api/dictionary/add

// Method: POST
// Path: /api/dictionary/add
// Data: { word }

export function add(word) {
  return request('/api/dictionary/add', { word }, 'POST')
}

// api /api/dictionary/delete

// Method: POST
// Path: /api/dictionary/delete
// Data: { word }

export function del(word) {
  return request('/api/dictionary/delete', { word }, 'POST')
}