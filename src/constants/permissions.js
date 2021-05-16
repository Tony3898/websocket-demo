const PERMISSIONS_CODES = {
  USER: ['GET'],
  ADMIN: ['GET', 'POST', 'PATCH', 'DELETE'],
}

const getPermissions = role => {
  return PERMISSIONS_CODES[role.toString().toUpperCase().trim()]
}
module.exports = getPermissions
