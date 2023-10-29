const ControlAccessLevel = {
    Disabled: 1,
    Mandatory: 2, //enabled and mandatory
    Enabled: 3, // force enabled
    Hidden: 4
}

const TrxType = {
    GET: 1, //can read only (add, delete disabled or hidden and all fields in the form are readonly)
    ADD: 2, //can read and add (delete disabled or hidden and fields in edit mode are all readonly)
    EDIT: 3, //can read, add, edit (delete disabled or hidden)
    DEL: 4 //can do all the above (everything is normal)
}

export {
    ControlAccessLevel,
    TrxType
}