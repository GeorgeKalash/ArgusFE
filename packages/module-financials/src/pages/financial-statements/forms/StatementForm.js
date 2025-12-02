import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { FinancialStatementRepository } from '@argus/repositories/src/repositories/FinancialStatementRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useForm } from '@argus/shared-hooks/src/hooks/form'

export default function StatementForm({ node, initialData, labels, maxAccess, setRecId, mainRecordId, onImportData }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const editMode = !!mainRecordId

  const invalidate = useInvalidate({
    endpointId: FinancialStatementRepository.FinancialStatement.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      showMetalCurrencyAmount: false,
      showFiatCurrencyAmount: false,
      showBaseAmount: false,
      sgId: null,
      isConfidential: false,
      showCurrentRateBaseAmount: false
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      sgId: yup
        .number()
        .nullable()
        .test('sgId-required-if-confidential', 'sgId is required when confidential', function (value) {
          const { isConfidential } = this.parent

          return !(isConfidential && !value)
        })
    }),
    onSubmit: async obj => {
      if (
        !obj.showBaseAmount &&
        !obj.showMetalCurrencyAmount &&
        !obj.showFiatCurrencyAmount &&
        !obj.showCurrentRateBaseAmount
      ) {
        stackError({
          message: labels.checkBoxesError
        })

        return
      }

      const res = await postRequest({
        extension: FinancialStatementRepository.FinancialStatement.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setRecId(res.recordId)
      }
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      formik.setValues(initialData)
    }
  }, [initialData])

  const onExport = async () => {
    const res = await getRequest({
      extension: FinancialStatementRepository.FinancialStatement.get2,
      parameters: `_recordId=${mainRecordId}`
    })

    if (res.record) {
      const jsonString = JSON.stringify(res, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financial_statement_${mainRecordId}.json`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const onImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.style.display = 'none'

    input.onchange = async e => {
      const file = e.target.files[0]
      if (!file) return

      const text = await file.text()
      const json = JSON.parse(text)
      const pack = json.record

      if (!pack?.fs) return

      const clonedPack = structuredClone(pack)

      const newFsId = mainRecordId || formik.values.recordId

      if (!newFsId) {
        return
      }

      clonedPack.fs.recordId = newFsId

      if (Array.isArray(clonedPack.nodes)) {
        clonedPack.nodes = clonedPack.nodes.map(n => ({ ...n, fsId: newFsId }))
      }

      if (Array.isArray(clonedPack.titles)) {
        clonedPack.titles = clonedPack.titles.map(t => ({ ...t, fsId: newFsId }))
      }

      if (Array.isArray(clonedPack.ledgers)) {
        clonedPack.ledgers = clonedPack.ledgers.map(l => ({ ...l, fsId: newFsId }))
      }

      if (onImportData) {
        onImportData(clonedPack)
      }

      node.current.viewNodeId = null
      node.current.viewNodeRef = ''
      node.current.viewNodedesc = ''

      const res = await postRequest({
        extension: FinancialStatementRepository.FinancialStatement.set2,
        record: JSON.stringify(clonedPack)
      })

      if (res?.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setRecId(res.recordId)
      }

      invalidate()
    }

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }

  const actions = [
    {
      key: 'Export',
      condition: true,
      onClick: onExport,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImport,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.FinancialStatements}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                maxLength='50'
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isConfidential'
                value={formik.values?.isConfidential}
                onChange={event => {
                  formik.setFieldValue('sgId', null)
                  formik.setFieldValue('isConfidential', event.target.checked)
                }}
                label={labels.isConfidential}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters={`_startAt=0&_pageSize=1000&filter=`}
                name='sgId'
                label={labels.securityGrp}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('sgId', newValue?.recordId || null)
                }}
                required={formik.values.isConfidential}
                readOnly={!formik.values.isConfidential}
                error={formik.touched.sgId && Boolean(formik.errors.sgId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showBaseAmount'
                value={formik.values?.showBaseAmount}
                onChange={event => formik.setFieldValue('showBaseAmount', event.target.checked)}
                label={labels.showBaseAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showMetalCurrencyAmount'
                value={formik.values?.showMetalCurrencyAmount}
                onChange={event => formik.setFieldValue('showMetalCurrencyAmount', event.target.checked)}
                label={labels.showMetalCurrencyAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showFiatCurrencyAmount'
                value={formik.values?.showFiatCurrencyAmount}
                onChange={event => formik.setFieldValue('showFiatCurrencyAmount', event.target.checked)}
                label={labels.showFiatCurrencyAmount}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='showCurrentRateBaseAmount'
                value={formik.values?.showCurrentRateBaseAmount}
                onChange={event => formik.setFieldValue('showCurrentRateBaseAmount', event.target.checked)}
                label={labels.showCurrentRateBaseAmount}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
