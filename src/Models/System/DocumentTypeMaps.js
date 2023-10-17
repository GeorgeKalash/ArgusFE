const getNewDocumentTypeMaps = () => {
    return {
        fromFunctionId: null,
        fromDTId: null,
        toFunctionId: null,
        dtId: null,
        fromFunctionName: null,
        toFunctionName: null,
        fromDTName: null,
        toDTName: null,
        useSameReference: false,
    }
}

const populateDocumentTypeMaps = (obj) => {
    return {
        fromFunctionId: obj.fromFunctionId,
        fromDTId: obj.fromDTId,
        toFunctionId: obj.toFunctionId,
        dtId: obj.dtId,
        fromFunctionName: obj.fromFunctionName,
        toFunctionName: obj.toFunctionName,
        fromDTName: obj.fromDTName,
        toDTName: obj.toDTName,
        useSameReference: obj.useSameReference,
    }
}

export {
    getNewDocumentTypeMaps,
    populateDocumentTypeMaps,
}