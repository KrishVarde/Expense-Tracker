export function getFirestoreErrorMessage(error) {
  const code = error?.code || ''

  switch (code) {
    case 'permission-denied':
      return 'Firestore blocked this action. Check that you are signed in and that firestore.rules are published.'
    case 'unavailable':
      return 'Firestore is temporarily unavailable. Try again in a moment.'
    case 'not-found':
      return 'That record was not found. It may have already been deleted.'
    case 'failed-precondition':
      return 'This query needs a Firestore index. Open the error link in the browser console if one appears.'
    default:
      return error?.message || 'Could not save to the cloud. Please try again.'
  }
}
