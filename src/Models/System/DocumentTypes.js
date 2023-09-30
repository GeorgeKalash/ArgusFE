// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

// formatDateFromApi("/Date(1695513600000)/")

const getNewDocumentTypes = () => {
    return {
        activeStatus: null,
        activeStatusName: null,
        dgId: null,
        dgName: null,
        ilId: null,
        ilName: null,
        name: null,
        nraId: null,
        nraRef: null,
        nraDescription: null,
        recordId: null,
        reference: null,
    }
}

const populateDocumentTypes = (obj) => {
    return {
        activeStatus: obj.activeStatus,
        activeStatusName: obj.activeStatusName,
        dgId: obj.dgId,
        dgName: obj.dgName,
        ilId: obj.ilId,
        ilName: obj.ilName,
        name: obj.name,
        nraId: obj.nraId,
        nraRef: obj.nraRef,
        nraDescription: obj.nraDescription,
        recordId: obj.recordId,
        reference: obj.reference,
    }
}

export {
    getNewDocumentTypes,
    populateDocumentTypes,
}