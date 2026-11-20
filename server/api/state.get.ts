import { getFullEventStateFromMysql } from '../utils/mysql'

export default defineEventHandler(async () => {
  return await getFullEventStateFromMysql()
})
