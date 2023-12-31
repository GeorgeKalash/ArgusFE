//not used anywhere until now 

const getNewBPAddress = () => {
  return {
    addressId: null,
    bpId: null,
    billTo: false,
    shipTo: false

    //Complex address also
  }
}

const populateBPAddress = obj => {
  return {
    addressId: obj.addressId,
    bpId: obj.bpId,
    billTo: obj.billTo,
    shipTo: obj.shipTo

    //Complex address also
  }
}

export { getNewBPAddress, populateBPAddress }
