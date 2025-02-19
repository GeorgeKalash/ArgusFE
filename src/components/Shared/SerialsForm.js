import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import * as yup from 'yup'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataSets } from 'src/resources/DataSets'
import toast from 'react-hot-toast'
import CustomNumberField from '../Inputs/CustomNumberField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from './ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from './DataGrid'
import { Fixed } from './Layouts/Fixed'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemChecks } from 'src/resources/SystemChecks'

export const SerialsForm = ({ row, values, checkForSiteId, window, updateRow }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { systemChecks } = useContext(ControlContext)
  const allowNegativeQty = systemChecks.some(check => check.checkId === SystemChecks.ALLOW_INVENTORY_NEGATIVE_QTY)

  const { formik } = useForm({
    initialValues: {
      sku: row?.sku,
      itemName: row?.itemName,
      itemId: row?.itemId,
      siteId: values.fromSiteId,
      siteName: values.fromSiteName,
      siteRef: values?.fromSiteRef,
      totalWeight: row?.qty,
      pieces: null,
      items: row?.serials || []
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            srlNo: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const serials = values.items.map((item, index) => ({
        ...item,
        id: index + 1,
        srlSeqNo: index + 1,
        srlNo: item.srlNo,
        seqNo: row.id
      }))

      updateRow({ changes: { serials } })

      window.close()
    }
  })

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Serial
  })

  const weightAssigned = formik.values.items.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight) || 0

    return weightSum + weightValue
  }, 0)
  const balance = formik.values.totalWeight - weightAssigned

  const columns = [
    {
      component: 'textfield',
      name: 'srlNo',
      label: labels.serialNo,
      updateOn: 'blur',
      onChange: async ({ row: { update, newRow } }) => {
        await checkSerialNo(newRow.srlNo, newRow.id, update)
      }
    },
    {
      component: 'numberfield',
      name: 'weight',
      label: labels.weight,
      props: {
        readOnly: true
      }
    }
  ]

  const clearRow = id => {
    let updatedItems = formik.values.items.filter(item => item.id !== id)

    if (updatedItems.length === 0) {
      updatedItems = [{ id: 0, srlNo: '', weight: '' }]
    }

    formik.setFieldValue('items', updatedItems)
  }

  const checkSerialNo = async (srlNo, id, update) => {
    if (srlNo) {
      const result = await getRequest({
        extension: InventoryRepository.Serial.get,
        parameters: `_srlNo=${srlNo}`
      })

      if (!result.record) {
        stackError({
          message: labels.unknownSerial
        })
        clearRow(id)
      } else if (result?.record?.itemId !== row?.itemId) {
        stackError({
          message: labels.serialDoesNotBelongItem
        })

        clearRow(id)
      } else if (checkForSiteId == true && allowNegativeQty == false) {
        const res = await getRequest({
          extension: InventoryRepository.AvailabilitySerial.get,
          parameters: `_srlNo=${srlNo}&_siteId=${values.siteId}`
        })

        if (!res.record) {
          stackError({
            message: labels.invalidSerial
          })

          clearRow(id)
        } else {
          update({ weight: result.record.weight })
        }
      } else {
        update({ weight: result.record.weight })
      }
    }
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Serial}
      form={formik}
      isCleared={false}
      isInfo={false}
      isSaved={false}
      actions={actions}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={labels?.sku}
                valueField='recordId'
                displayField='sku'
                valueShow='sku'
                secondValueShow='itemName'
                form={formik}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                maxAccess={maxAccess}
                value={formik.values.totalWeight}
                readOnly
                error={formik.touched.totalWeight && Boolean(formik.errors.totalWeight)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weightAssigned'
                label={labels.weightAssigned}
                maxAccess={maxAccess}
                value={weightAssigned}
                readOnly
                error={formik.touched.weightAssigned && Boolean(formik.errors.weightAssigned)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='balanceWeight'
                label={labels.balanceWeight}
                maxAccess={maxAccess}
                value={balance}
                readOnly
                error={formik.touched.balanceWeight && Boolean(formik.errors.balanceWeight)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pieces'
                label={labels.pieces}
                maxAccess={maxAccess}
                value={formik?.values?.items?.filter(item => item.srlNo !== undefined)?.length}
                readOnly
                error={formik.touched.pieces && Boolean(formik.errors.pieces)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            name='items'
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
