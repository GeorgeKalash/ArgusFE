import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import FormShell from './FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import ResourceComboBox from './ResourceComboBox'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { useResourceQuery } from 'src/hooks/resource'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import CustomNumberField from '../Inputs/CustomNumberField'
import { ResourceLookup } from './ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataGrid } from './DataGrid'
import { Fixed } from './Layouts/Fixed'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemChecks } from 'src/resources/SystemChecks'

export const SerialsForm = ({ row, siteId, checkForSiteId, window, updateRow, disabled }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels, systemChecks } = useContext(ControlContext)
  const allowNegativeQty = systemChecks.some(check => check.checkId === SystemChecks.ALLOW_INVENTORY_NEGATIVE_QTY)
  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value || false

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Serial
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      sku: row?.sku,
      itemName: row?.itemName,
      itemId: row?.itemId,
      siteId,
      totalWeight: row?.qty || 0,
      pieces: null,
      items: row?.serials || []
    },
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          srlNo: yup.string().test(function (value) {
            if (this.options.from[1]?.value?.items?.length === 1) {
              return true
            }

            return !!value
          })
        })
      )
    }),
    onSubmit: async values => {
      const validSerials = values.items.filter(serialDetail => serialDetail?.srlNo)

      const serials = validSerials.map((item, index) => ({
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

  const weightAssigned = formik.values.items.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight) || 0

    return weightSum + weightValue
  }, 0)
  const balance = formik.values.totalWeight - weightAssigned || 0

  const columns = [
    {
      component: 'textfield',
      name: 'srlNo',
      label: labels.serialNo,
      jumpToNextLine: jumpToNextLine,
      updateOn: 'blur',
      onChange: async ({ row: { update, newRow, oldRow, addRow } }) => {
        if (newRow.srlNo !== oldRow?.srlNo) {
          await checkSerialNo(newRow, update, addRow)
        }
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
    const updatedItems = formik.values.items.map(item => (item.id === id ? { ...item, srlNo: '', weight: '' } : item))

    formik.setFieldValue('items', updatedItems)
  }

  const removeRow = id => {
    let updatedItems = formik.values.items.filter(item => item.id !== id)

    if (updatedItems.length === 0) {
      updatedItems = [{ id: 0, srlNo: '', weight: '' }]
    }

    formik.setFieldValue('items', updatedItems)
  }

  const checkSerialNo = async (newRow, update, addRow) => {
    const { srlNo, id } = newRow

    if (srlNo) {
      const result = await getRequest({
        extension: InventoryRepository.Serial.get,
        parameters: `_srlNo=${srlNo}`
      })

      if (!result.record) {
        stackError({
          message: platformLabels.unknownSerial
        })

        removeRow(id)
      } else if (result?.record?.itemId !== row?.itemId) {
        stackError({
          message: platformLabels.serialDoesNotBelongItem
        })

        clearRow(id)
      } else if (checkForSiteId && !allowNegativeQty && formik.values.siteId) {
        const res = await getRequest({
          extension: InventoryRepository.AvailabilitySerial.get,
          parameters: `_srlNo=${srlNo}&_siteId=${formik.values.siteId}`
        })

        if (!res.record) {
          stackError({
            message: labels.invalidSerial
          })

          clearRow(id)
        } else {
          update({ weight: result.record.weight })
          addRow({
            fieldName: 'srlNo',
            changes: {
              id: newRow.id,
              srlNo: newRow.srlNo,
              weight: result.record.weight
            }
          })
        }
      } else {
        update({ weight: result.record.weight })
        addRow({
          fieldName: 'srlNo',
          changes: {
            id: newRow.id,
            srlNo: newRow.srlNo,
            weight: result.record.weight
          }
        })
      }
    }
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled
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
      maxAccess={maxAccess}
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
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='weightAssigned'
                label={labels.weightAssigned}
                maxAccess={maxAccess}
                value={weightAssigned}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='balanceWeight'
                label={labels.balanceWeight}
                maxAccess={maxAccess}
                value={balance}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='pieces'
                label={labels.pieces}
                maxAccess={maxAccess}
                value={formik?.values?.items?.filter(item => item.srlNo !== undefined)?.length}
                readOnly
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
            disabled={disabled}
            allowDelete={!disabled}
            allowAddNewLine={!disabled}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
