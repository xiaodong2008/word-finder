import { request } from "./";

// api /api/user/register

// Method: POST
// Path: /api/user/register
// Data: { username(username), password }
export function register(username, password) {
  return request('/api/user/register', { username, password }, 'POST')
}

// api /api/user/login

// Method: POST
// Path: /api/user/login
// Data: { username(username), password }
export function login(username, password) {
  return request('/api/user/login', { username, password }, 'POST')
}

// api /api/user/data

// Method: GET
// Path: /api/user/data
// Data: { }

export function data() {
  return request('/api/user/data', {})
}

// api /api/user/logout

// Method: POST
// Path: /api/user/logout
// Data: { }

export function logout() {
  return request('/api/user/logout', {}, 'POST')
}