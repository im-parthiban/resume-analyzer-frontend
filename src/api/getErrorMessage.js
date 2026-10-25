export default function getErrorMessage(err) {
  if (!err.response) {
    return 'Cannot reach the server. Is the backend running?'
  }
  switch (err.response.status) {
    case 400:
      return 'Please check the details you entered.'
    case 401:
      return 'Invalid email or password.'
    case 409:
      return 'This email is already registered.'
    default:
      return 'Something went wrong. Please try again.'
  }
}