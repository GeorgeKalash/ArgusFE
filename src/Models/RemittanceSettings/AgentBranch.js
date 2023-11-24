// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const getNewAgentBranch = () => {
  return {
    recordId: null,
    agent: null,
    swiftCode: null
  }
}

const populateAgentBranch = obj => {
  return {
    recordId: obj.recordId,
    agent: obj.agent,
    swiftCode: swiftCode
  }
}

export { getNewAgentBranch , populateAgentBranch }
