const DEFAULT_PAGE_NUMBER = 1
// if set to 0 the mongoose get all data
const DEFAULT_PAGE_LIMIT = 0

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT
  const skip = limit * (page - 1)
  return {
    limit,
    skip
  }
}

module.exports = {
  getPagination
}
