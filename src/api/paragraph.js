import { request } from "./";

// api /api/paragraph/generate

// Method: POST
// Path: /api/paragraph/generate
// Data: { words, level, subject }

export function generate(words, level, subject) {
  return request('/api/paragraph/generate', { words, level, subject }, 'POST', {
    timeout: 1000 * 60 * 3
  })
}

// api /api/paragraph/history

// Method: GET
// Path: /api/paragraph/history
// Data: { start }

export function history(start) {
  return request('/api/paragraph/history', { start })
}