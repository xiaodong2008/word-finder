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

// api /api/user/redeem

// Method: POST
// Path: /api/user/redeem
// Data: { code }

export function redeem(code) {
  return request('/api/user/redeem', { code }, 'POST')
}

// api /api/user/word

// Method: GET
// Path: /api/user/word
// Data: { start }

export function word(start) {
  return request('/api/user/word', { start })
}

// api /api/user/word-count

// Method: GET
// Path: /api/user/word-count
// Data: { }

export function wordCount() {
  return request('/api/user/word-count', {})
}

// api /api/user/activate

// Method: GET
// Path: /api/user/activate
// Data: { start }

export function activate(start) {
  return request('/api/user/activate', { start })
}

// api /api/user/activate-count

// Method: GET
// Path: /api/user/activate-count
// Data: { }

export function activateCount() {
  return request('/api/user/activate-count', {})
}