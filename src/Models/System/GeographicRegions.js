// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// formatDateFromApi("/Date(1695513600000)/")

const getNewGeographicRegion = () => {
  return {
    recordId: null,
    reference: null,
    name: null
  }
}

const populateGeographicRegions = obj => {
  return {
    recordId: obj.recordId,
    reference: obj.reference,
    dgId: obj.dgId,
    name: obj.name
  }
}

export { getNewGeographicRegion, populateGeographicRegions }
