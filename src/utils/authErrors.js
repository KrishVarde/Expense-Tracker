export function getAuthErrorMessage(error) {
  const code = error?.code || ''

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in this Firebase project.'
    default:
      return error?.message || 'Something went wrong. Please try again.'
  }
}
