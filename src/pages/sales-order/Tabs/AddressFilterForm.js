import Table from 'src/components/Shared/Table'
import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import * as yup from 'yup'
import CustomTextField from 'src/components/Inputs/CustomTextField'

export default function AddressFilterForm({ labels, shipment, bill, form, window }) {
  const [data, setData] = useState([])
  const { getRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    initialValues: { search: '', cityId: null, countryId: null },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      cityId: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      const checkedADD = data?.list?.find(obj => obj.checked)
      if (!checkedADD.addressId) {
        form.setFieldValue('shipAddress', '')
        form.setFieldValue('BillAddress', '')
        window.close()

        return
      }

      if (shipment || bill) {
        const address = await getAddress(checkedADD.addressId)
        if (shipment) {
          form.setFieldValue('shipAddress', address)
          form.setFieldValue('shipAddressId', checkedADD.addressId)
          form.setFieldValue('shipToAddressId', checkedADD.addressId)
        }
        if (bill) {
          form.setFieldValue('BillAddress', address)
          form.setFieldValue('billAddressId', checkedADD.addressId)
          form.setFieldValue('billToAddressId', checkedADD.addressId)
        }
      }

      window.close()
    }
  })
  async function getAddress(addressId) {
    if (!addressId) return null

    try {
      const res = await getRequest({
        extension: SystemRepository.FormattedAddress.get,
        parameters: `_addressId=${addressId}`
      })

      return res?.record?.formattedAddress.replace(/(\r\n|\r|\n)+/g, '\r\n')
    } catch (error) {}
  }

  const rowColumns = [
    {
      field: 'address',
      headerName: ''
    }
  ]

  const LoadShipAddresses = async () => {
    if (formik.values.countryId && formik.values.cityId) {
      const res = await getRequest({
        extension: SaleRepository.FilterAddress.snapshot,
        parameters: `_countryId=${formik.values.countryId}&_cityId=${formik.values.cityId}&_clientId=${
          form.values.clientId
        }&_filter=${formik.values.search || ''}`
      })
      if (res?.list?.length > 0) {
        const formattedAddressList = await Promise.all(
          res.list.map(async item => {
            return {
              addressId: item.recordId,
              address: `${item.name || ''}, ${item.street1 || ''}, ${item.street2 || ''}, ${item.city || ''}, ${
                item.phone || ''
              },${item.phone2 || ''},${item.email1 || ''}`,
              checked: false
            }
          })
        )
        setData({ list: formattedAddressList })
      } else setData({ list: [] })
    } else setData({ list: [] })
  }

  const filteredData = formik.values.search
    ? {
        list: data.list.filter(
          item => item.address && item.address.toString().includes(formik.values.search.toLowerCase())
        )
      }
    : data

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }
  useEffect(() => {
    LoadShipAddresses()
  }, [formik.values.search, formik.values.cityId, formik.values.countryId])

  return (
    <FormShell resourceId={ResourceIds.SalesOrder} form={formik} editMode={true} isSavedClear={false} isCleared={false}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                required
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cityId', '')
                  formik.setFieldValue('countryId', newValue?.recordId || null)
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.City.snapshot}
                parameters={{
                  _countryId: formik.values.countryId,
                  _stateId: 0
                }}
                valueField='name'
                displayField='name'
                name='city'
                required
                label={labels.city}
                form={formik}
                secondDisplayField={false}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cityId', newValue?.recordId || null)
                  formik.setFieldValue('city', newValue?.name || null)
                }}
                errorCheck={'cityId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                sx={{ width: '30%' }}
                onChange={handleSearchChange}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={filteredData}
            setData={setData}
            rowId={['recordId']}
            isLoading={false}
            pagination={false}
            checkTitle={''}
            showCheckboxColumn={true}
            viewCheckButtons={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
