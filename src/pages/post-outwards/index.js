import { useState, useEffect, useContext } from 'react'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataSets } from 'src/resources/DataSets'
import FormShell from 'src/components/Shared/FormShell'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'

const Postoutwards = () => {
  const [data, setData] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const fetchRemittanceData = () => {
    if (!formik.values.countryId) return

    getRequest({
      extension: RemittanceOutwardsRepository.Postoutwards.qry,
      parameters: `_countryId=${formik.values.countryId}&_currencyId=${formik.values.currencyId || 0}&_corId=${
        formik.values.corId || 0
      }&_dispersalType=${formik.values.dispersalType || 0}`
    })
      .then(response => {
        setData(response.list || [])
      })
      .catch(error => {})
  }

  const {
    labels: _labels,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchRemittanceData,
    endpointId: RemittanceOutwardsRepository.Postoutwards.qry,
    datasetId: ResourceIds.PostOutwards
  })

  const { formik } = useForm({
    initialValues: {
      countryId: '',
      currencyId: '',
      corId: '',
      dispersalType: ''
    },
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required()
    }),
    onSubmit: async values => {
      const checkedUserIds = data.filter(row => row.checked).map(row => row.recordId)

      if (checkedUserIds.length > 0) {
        try {
          await postRequest({
            extension: RemittanceOutwardsRepository.Postoutwards.post2,
            record: JSON.stringify({ ids: checkedUserIds })
          })
        } catch (error) {}
      }
      fetchRemittanceData()
      toast.success(platformLabels.Posted)
    }
  })

  const rowColumns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },

    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'corName',
      headerName: _labels.cor,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.client,
      flex: 1
    },
    {
      field: 'amount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    }
  ]

  useEffect(() => {
    fetchRemittanceData()
  }, [formik.values.countryId, formik.values.currencyId, formik.values.corId, formik.values.dispersalType])

  return (
    <FormShell
      resourceId={ResourceIds.PostOutwards}
      form={formik}
      maxAccess={access}
      isCleared={false}
      infoVisible={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='countryId'
                    label={_labels.country}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name', 'flName']}
                    required
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        formik.setFieldValue('countryId', newValue.recordId)
                      } else {
                        formik.setFieldValue('countryId', '')
                        setData([])
                      }
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>
                <Grid item xs={10}>
                  <ResourceLookup
                    endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                    valueField='reference'
                    displayField='name'
                    name='corId'
                    label={_labels.cor}
                    form={formik}
                    displayFieldWidth={2}
                    valueShow='corRef'
                    secondValueShow='corName'
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('corName', newValue ? newValue.name : '')
                      formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={_labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'Foreign Language Name' }
                    ]}
                    values={formik.values}
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.recordId || null)
                    }}
                    error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  />
                </Grid>
                <Grid item xs={10}>
                  <ResourceComboBox
                    name='dispersalType'
                    label={_labels.dispersal}
                    datasetId={DataSets.RT_Dispersal_Type}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dispersalType', newValue?.key)
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            columns={rowColumns}
            gridData={{ list: data }}
            setData={setData}
            rowId={['recordId']}
            pageSize={50}
            pagination={!!formik.values.countryId}
            paginationType='client'
            refetch={refetch}
            isLoading={false}
            maxAccess={access}
            showCheckboxColumn={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Postoutwards
