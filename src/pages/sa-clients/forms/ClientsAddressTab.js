import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import AddressGridTab from 'src/components/Shared/AddressGridTab'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import AddressForm from 'src/components/Shared/AddressForm'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const ClientsAddressTab = ({ store, window, setStore, ...props }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const fetchGridData = async (options = {}) => {
    const { _startAt = 0, _pageSize = 50 } = options
    const parameters = `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=1|${recordId}`

    const response = await getRequest({
      extension: SaleRepository.Address.page,
      parameters
    })

    return { ...response, _startAt }
  }

  const {
    query: { data, refetch },
    paginationParameters
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: SaleRepository.Address.page,
    datasetId: ResourceIds.Address
  })

  const refetchAddresses = () => {
    if (recordId) refetch()
  }

  const delAddress = async obj => {
    const clientId = recordId

    const payload = {
      clientId,
      addressId: obj.recordId
    }

    await postRequest({
      extension: SaleRepository.Address.del,
      record: JSON.stringify(payload)
    })

    toast.success(platformLabels.Deleted)
    refetchAddresses()
  }

  const addAddress = () => {
    openForm()
  }

  const openForm = async recordId => {
    const clientId = store.recordId

    let latestRecord = await getRequest({
      extension: SaleRepository.Client.get,
      parameters: `_recordId=${clientId}`
    }).then(r => r.record)

    let isDefaultBill = latestRecord?.billAddressId === recordId
    let isDefaultShip = latestRecord?.shipAddressId === recordId

    const updateAndRefreshDefault = async type => {
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

    stack({
      Component: AddressForm,
      props: {
        recordId,
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
            refetchAddresses()
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

  const addressGridData = { ...data, list: (data?.list || []).map(row => row.address) }

  return (
    <AddressGridTab
      addressGridData={addressGridData}
      addAddress={addAddress}
      delAddress={delAddress}
      editAddress={editAddress}
      paginationParameters={paginationParameters}
      columns={columns}
      {...props}
    />
  )
}

export default ClientsAddressTab
