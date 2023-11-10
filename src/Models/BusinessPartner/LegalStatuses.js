const getNewLegalStatuses = () => {
    return {
        recordId: null,
        name: null,
        reference: null,
    }
}

const populateLegalStatuses = (obj) => {
    return {
        recordId: obj.recordId,
        name: obj.name,
        reference: obj.reference,
    }
}

export {
    getNewLegalStatuses,
    populateLegalStatuses,
}