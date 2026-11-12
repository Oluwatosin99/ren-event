import { getFullEventState } from '../utils/db'

export default defineEventHandler(() => {
  return getFullEventState()
})
