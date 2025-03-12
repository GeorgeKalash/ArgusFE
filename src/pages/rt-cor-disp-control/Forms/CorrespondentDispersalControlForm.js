import { Grid } from '@mui/material'
import { useContext } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import { CommonContext } from 'src/providers/CommonContext'

const CorrespondentDispersalForm = ({ recordId, labels, maxAccess, interfaceId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const initialValues = {
    corId: recordId,
    countryId: 0,
    currencyId: 0,
    plantId: 0,
    items: []
  }

  const { formik } = useForm({
    initialValues,
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const filteredObj = {
        ...obj,
        items:
          obj.items
            ?.filter(item => item.corDeliveryMode) 
            .map(({ items, ...rest }) => rest) || [] 
      }

      await postRequest({
        extension: RemittanceSettingsRepository.CorDispControl.set2,
        record: JSON.stringify(filteredObj)
      })

      toast.success(platformLabels.Updated)
    }
  })

  async function getDispersalMode() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.RT_Dispersal_Type,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const onPreview = async () => {
    if (formik.values.plantId && formik.values.countryId && formik.values.currencyId) {
      const dispersalModes = await getDispersalMode()

      const res = await getRequest({
        extension: RemittanceSettingsRepository.CorDispControl.qry,
        parameters: `_corId=${formik.values.corId}&_countryId=${formik.values.countryId}&_currencyId=${formik.values.currencyId}&_plantId=${formik.values.plantId}`
      })

      const resData = res?.list || []

      const items = dispersalModes.map((mode, index) => {
        const existingItem = resData.find(item => parseInt(item.dispersalType) === mode.id)

        return {
          id: index + 1,
          dispersalTypeName: mode.value,
          dispersalType: mode.id,
          ...formik.values,
          ...existingItem
        }
      })

      formik.setFieldValue('items', items)
    }
  }

  const columns = [
    {
      component: 'checkbox',
      label: labels.isActive,
      name: 'isActive'
    },
    {
      component: 'textfield',
      name: 'plantName',
      label: labels.branch,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.corDeliveryModeName,
      name: 'corDeliveryModeName',
      variableParameters: [
        { key: 'countryId', value: 'countryId' },
        { key: 'currencyId', value: 'currencyId' },
        { key: 'dispersalMode', value: 'dispersalType' }
      ],
      props: {
        endpointId: RemittanceBankInterface.DeliveryMode.qry,
        parameters: `_interfaceId=${interfaceId}&_corId=${recordId}`,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'name', to: 'corDeliveryModeName' },
          { from: 'reference', to: 'corDeliveryMode' },
          { from: 'recordId', to: 'recordId' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.dispersalType,
      name: 'dispersalTypeName',
      props: {
        datasetId: DataSets.RT_Dispersal_Type,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' }
        ],
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'currencyName',
      label: labels.currency,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'countryName',
      label: labels.country,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'corName',
      label: labels.corName,
      props: {
        readOnly: true
      }
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Countries.qry}
              parameters={`_interfaceId=${interfaceId || 0}`}
              name='countryId'
              label={labels.country}
              valueField='recordId'
              required
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              displayFieldWidth={1.75}
              onChange={(event, newValue) => {
                formik.setFieldValue('countryId', newValue?.recordId || 0)
                formik.setFieldValue('countryName', newValue?.name || 0)
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Currencies.qry}
              parameters={`_interfaceId=${interfaceId || 0}&_countryId=${formik.values.countryId || 0}`}
              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('currencyId', newValue?.recordId || 0)
                formik.setFieldValue('currencyName', newValue?.name || null)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
            />
          </Grid>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={SystemRepository.Plant.qry}
              name='plantId'
              label={labels.plant}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'plant Ref' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('plantId', newValue?.recordId || 0)
                formik.setFieldValue('plantName', newValue?.name || 0)
              }}
              error={formik.touched.plantId && Boolean(formik.errors.plantId)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton onClick={onPreview} label={platformLabels.Preview} color='#231f20' />
          </Grid>
        </Grid>
      </Fixed>

      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          allowDelete={false}
          columns={columns}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default CorrespondentDispersalForm
