const TOKEN_KEY = 'divvy_token'
const EMAIL_KEY = 'divvy_email'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
}

export function getSessionEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}
