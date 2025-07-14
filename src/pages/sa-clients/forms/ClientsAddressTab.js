import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useState } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import AddressForm from 'src/components/Shared/AddressForm'

const ClientsAddressTab = ({ store, window, setStore, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [addressGridData, setAddressGridData] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const getAddressGridData = recordId => {
    setAddressGridData([])

    const defaultParams = `_params=1|${recordId}`
    var parameters = defaultParams

    getRequest({
      extension: SaleRepository.Address.qry,
      parameters: parameters
    }).then(res => {
      res.list = res.list.map(row => (row = row.address))
      setAddressGridData(res)
    })
  }

  const delAddress = obj => {
    const clientId = recordId
    obj.clientId = clientId
    obj.addressId = obj.recordId
    postRequest({
      extension: SaleRepository.Address.del,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Deleted)
      getAddressGridData(clientId)
    })
  }

  function addAddress() {
    openForm()
  }

  async function openForm(recordId) {
    const clientId = store.recordId

    let latestRecord = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    }).then(r => r.record)

    async function updateAndRefreshDefault(type) {
      latestRecord = await getRequest({
        extension: SaleRepository.Client.get,
        parameters: `_recordId=${clientId}`
      }).then(r => r.record)

      const updatePayload = {
        ...latestRecord,
        [`${type === 'bill' ? 'billAddressId' : 'shipAddressId'}`]: recordId
      }

      await postRequest({
        extension: SaleRepository.Client.set,
        record: JSON.stringify(updatePayload)
      })

      setStore(prev => ({
        ...prev,
        record: updatePayload
      }))

      toast.success(platformLabels.Updated)

      isDefaultBill = updatePayload.billAddressId === recordId
      isDefaultShip = updatePayload.shipAddressId === recordId
    }

    let isDefaultBill = latestRecord?.billAddressId === recordId
    let isDefaultShip = latestRecord?.shipAddressId === recordId

    stack({
      Component: AddressForm,
      props: {
        recordId,
        changeClear: true,
        onSubmit: async (obj, window) => {
          if (obj) {
            const data = {
              clientId,
              address: obj,
              addressId: obj.recordId
            }

            await postRequest({
              extension: SaleRepository.Address.set,
              record: JSON.stringify(data)
            })

            toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
            getAddressGridData(clientId)
            window.close()
          }
        },
        actions: [
          {
            key: 'DefaultBilling',
            condition: true,
            onClick: async () => {
              await updateAndRefreshDefault('bill')
            },
            get disabled() {
              return !recordId || isDefaultBill
            }
          },
          {
            key: 'DefaultShipping',
            condition: true,
            onClick: async () => {
              await updateAndRefreshDefault('ship')
            },
            get disabled() {
              return !recordId || isDefaultShip
            }
          }
        ]
      }
    })
  }

  const editAddress = obj => {
    openForm(obj.recordId)
  }

  useEffect(() => {
    recordId && getAddressGridData(recordId)
  }, [recordId])

  const columns = [
    {
      field: 'city',
      headerName: platformLabels.city,
      flex: 1
    },
    {
      field: 'street1',
      headerName: platformLabels.street,
      flex: 1
    }
  ]

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      columns={columns}
      {...props}
    />
  )
}

export default ClientsAddressTab
