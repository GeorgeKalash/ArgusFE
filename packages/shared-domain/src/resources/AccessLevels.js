const ControlAccessLevel = {
  Disabled: 1,
  Mandatory: 2, //enabled and mandatory
  Enabled: 3, // force enabled
  Hidden: 4
}

// const TrxType = {
//   NOACCESS: 0, //No access
//   GET: 1, //can read only (add, delete disabled or hidden and all fields in the form are readonly)
//   ADD: 2, //can read and add (delete disabled or hidden and fields in edit mode are all readonly)
//   EDIT: 3, //can read, add, edit (delete disabled or hidden)
//   DEL: 4 //can do all the above (everything is normal)
// }

const TrxType = {
  GET: 1,
  ADD: 2,
  EDIT: 3,
  DEL: 4,
  CLOSE: 5,
  REOPEN: 6,
  POST: 7,
  UNPOST: 8
}

const accessMap = {
  1: 'get',
  2: 'add',
  3: 'edit',
  4: 'del',
  5: 'close',
  6: 'reopen',
  7: 'post',
  8: 'unpost'
}

export { ControlAccessLevel, TrxType, accessMap }
