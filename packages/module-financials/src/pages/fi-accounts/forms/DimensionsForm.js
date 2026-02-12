import { useContext, useEffect, useMemo } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'

export default function DimensionsForm({ store, maxAccess }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { recordId: accountId } = store

  const toSafeFieldKey = value => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    return raw.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  const dimensionFields = useMemo(() => {
    const dimCount = parseInt(
      defaultsData?.list?.find(obj => obj.key === 'DimCount')?.value,
      10
    )

    if (!Number.isFinite(dimCount) || dimCount <= 0) return []

    const getDimNumberFromKey = key => {
      const m = String(key || '').match(/^tpaDimension(\d+)$/)
      return m ? parseInt(m[1], 10) : null
    }

    const filteredList = (defaultsData?.list || [])
      .map(obj => ({
        ...obj,
        dimensionNumber: getDimNumberFromKey(obj.key)
      }))
      .filter(obj => obj.dimensionNumber && obj.dimensionNumber <= dimCount)
      .sort((a, b) => a.dimensionNumber - b.dimensionNumber)

    const fields = filteredList.map(obj => {
      const dimensionNumber = obj.dimensionNumber

      const safeValueKey = toSafeFieldKey(obj.value)
      const fallbackKey = toSafeFieldKey(obj.key)
      const fieldKey = safeValueKey || fallbackKey

      return {
        dimensionNumber,
        fieldKey,
        label: String(obj.value ?? obj.key)
      }
    })

    const seen = new Set()
    return fields.map(f => {
      let k = f.fieldKey
      if (seen.has(k)) k = `${k}_${f.dimensionNumber}`
      seen.add(k)
      return { ...f, fieldKey: k }
    })
  }, [defaultsData])

  const { formik } = useForm({
    initialValues: { accountId: accountId ?? '' },
    onSubmit: async () => {
      const submissionData = dimensionFields.map(f => ({
        dimension: f.dimensionNumber,
        id: formik.values[f.fieldKey],
        accountId
      }))

      const filteredData = submissionData.filter(
        item => item.id !== '' && item.id !== undefined && item.id !== null
      )

      if (filteredData.length > 0) {
        await postRequest({
          extension: FinancialRepository.AccountDimensions.set2,
          record: JSON.stringify({
            accountId,
            data: filteredData
          })
        })
      }

      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    const run = async () => {
      if (!accountId) return
      if (!dimensionFields.length) return

      const nextValues = { ...formik.values, accountId }

      dimensionFields.forEach(f => {
        if (nextValues[f.fieldKey] === undefined) nextValues[f.fieldKey] = null
      })

      const res = await getRequest({
        extension: FinancialRepository.AccountDimensions.qry,
        parameters: `_filter=&_accountId=${accountId}`
      })

      const list = res?.list || []
      const mapByDimension = new Map(dimensionFields.map(f => [Number(f.dimensionNumber), f.fieldKey]))

      list.forEach(item => {
        const fieldKey = mapByDimension.get(Number(item.dimension))
        if (fieldKey) nextValues[fieldKey] = item.id ?? null
      })

      formik.setValues(nextValues, false)
    }

    run()
  }, [dimensionFields])

  const leftColumn = dimensionFields.slice(0, 10)
  const rightColumn = dimensionFields.slice(10, 20)

  const renderField = f => (
    <Grid item xs={12} key={f.fieldKey}>
      <ResourceComboBox
        endpointId={FinancialRepository.DimensionValue.qry}
        parameters={`_dimension=${f.dimensionNumber}`}
        name={f.fieldKey}
        label={f.label}
        valueField='id'
        displayField='name'
        values={formik.values}
        onChange={(_, newValue) => formik.setFieldValue(f.fieldKey, newValue?.id ?? null)}
      />
    </Grid>
  )

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {leftColumn.map(renderField)}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {rightColumn.map(renderField)}
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
