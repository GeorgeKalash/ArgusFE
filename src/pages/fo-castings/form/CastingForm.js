import { Grid } from '@mui/material'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useInvalidate } from 'src/hooks/resource'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export default function CastingForm({ recordId, access, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.Casting,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: FoundryRepository.Casting.page
  })
  const castingWorkCenterId = defaultsData?.list?.find(({ key }) => key === 'castingWorkCenterId')?.value

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      status: 1,
      date: new Date(),
      waxId: null,
      grossWgt: null,
      mouldWgt: null,
      rmWgt: null,
      netWgt: null,
      suggestedWgt: null,
      inputWgt: null,
      netInputWgt: null,
      outputWgt: null,
      loss: null,
      lossPct: null,
      allowedLossPct: null,
      lossVariationPct: null,
      laborId: null,
      lineId: null,
      mouldId: null,
      metalId: null,
      metalColorId: null,
      stdLossRate: null,
      factor: null,
      scrapWgt: null
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      mouldId: yup.number().required(),
      metalId: yup.number().required(),
      waxId: yup.number().required(),
      metalColorId: yup.number().required(),
      factor: yup.number().required(),
      stdLossRate: yup.number().required(),
      laborId: yup.number().required(),
      groddWgt: yup.number().required(),
      grossWgt: yup.number().max(9999999.999).required(),
      rmWgt: yup.number().max(9999999.999).required(),
      mouldWgt: yup.number().max(9999999.999).required(),
      netWgt: yup.number().max(9999999.999).required(),
      suggestedWgt: yup.number().max(9999999.999).required(),
      inputWgt: yup.number().max(9999999.999).required(),
      netInputWgt: yup.number().max(9999999.999).required(),
      outputWgt: yup.number().max(9999999.999).required(),
      loss: yup.number().min(0).max(9999999.999).required(),
      lossVariationPct: yup.number().max(100).required(),
      lossPct: yup.number().max(100).required()
    }),
    onSubmit: async obj => {}
  })

  const editMode = !!formik.values.recordId
  const isCancelled = formik.values.status === -1
  const isPosted = formik.values.status === 3
  const actions = []

  async function getfactorStdLoss(metalId, metalColorId) {
    if (!metalId && !metalColorId) return

    const res = await getRequest({
      extension: FoundryRepository.MetalSettings.get,
      parameters: `_metalId=${metalId}&_metalColorId=${metalColorId}`
    })

    return res?.record
  }
  async function getWaxInfo(waxId) {
    if (!waxId) return

    const res = await getRequest({
      extension: FoundryRepository.Wax.get,
      parameters: `_recordId=${waxId}`
    })

    return res?.record
  }

  return (
    <FormShell
      resourceId={ResourceIds.FoCastings}
      functionId={SystemFunction.Casting}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isCancelled || isPosted}
      disabledSavedClear={isCancelled || isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid container item xs={12} spacing={2}>
              <Grid item xs={6}>
                <Grid container direction='column' spacing={2}>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={SystemRepository.DocumentType.qry}
                      parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.Casting}`}
                      name='dtId'
                      label={labels.docType}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      readOnly={editMode}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('dtId', newValue?.recordId)
                        changeDT(newValue)
                      }}
                      error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={!editMode && maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('reference', '')}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomDatePicker
                      name='date'
                      required
                      label={labels.date}
                      value={formik?.values?.date}
                      maxAccess={maxAccess}
                      readOnly={isCancelled || isPosted}
                      onChange={formik.setFieldValue}
                      onClear={() => formik.setFieldValue('date', null)}
                      error={formik.touched.date && Boolean(formik.errors.date)}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceLookup
                      endpointId={FoundryRepository.Wax.open}
                      name='waxId'
                      readOnly={isCancelled || isPosted}
                      label={labels.wax}
                      secondDisplayField={false}
                      valueField='reference'
                      displayField='reference'
                      valueShow='reference'
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'mouldRef', value: 'Mould' },
                        { key: 'prodLineName', value: 'Production Line' }
                      ]}
                      form={formik}
                      onChange={async (event, newValue) => {
                        const factorStdLoss = await getfactorStdLoss(newValue?.metalId, newValue?.metalColorId)
                        const waxInfo = await getWaxInfo(newValue?.recordId)
                        formik.setFieldValue('grossWgt', waxInfo?.grossWgt || 0)
                        formik.setFieldValue('rmWgt', waxInfo?.rmWgt || 0)
                        formik.setFieldValue('mouldWgt', waxInfo?.mouldWgt || 0)
                        formik.setFieldValue('netWgt', waxInfo?.netWgt || 0)
                        formik.setFieldValue('suggestedWgt', waxInfo?.suggestedWgt || 0)
                        formik.setFieldValue('factor', factorStdLoss?.rate || 0)
                        formik.setFieldValue('stdLossRate', factorStdLoss?.stdLossRate || 0)
                        formik.setFieldValue('mouldId', newValue?.mouldId || null)
                        formik.setFieldValue('metalId', newValue?.metalId || null)
                        formik.setFieldValue('metalColorId', newValue?.metalColorId || null)
                        formik.setFieldValue('lineId', newValue?.lineId || null)
                        formik.setFieldValue('waxId', newValue?.recordId || null)
                      }}
                      errorCheck={'waxId'}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={FoundryRepository.Mould.qry}
                      name='mouldId'
                      parameters='_params=&_startAt=0&_pageSize=1000'
                      label={labels.mould}
                      required
                      valueField='recordId'
                      readOnly
                      displayField={'reference'}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('mouldId', newValue?.recordId || null)
                        formik.setFieldValue('mouldRef', newValue?.reference || '')
                      }}
                      error={formik.touched?.mouldId && Boolean(formik.errors?.mouldId)}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Metals.qry}
                      name='metalId'
                      label={labels.metal}
                      valueField='recordId'
                      displayField={'reference'}
                      readOnly
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('metalId', newValue?.recordId || null)
                      }}
                      required
                      error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={InventoryRepository.MetalColor.qry}
                      name='metalColorId'
                      readOnly
                      required
                      label={labels.metalColor}
                      valueField='recordId'
                      displayField={'reference'}
                      values={formik.values}
                      maxAccess={maxAccess}
                      onChange={async (event, newValue) => {
                        // formik.setFieldValue('metalColorId', newValue?.recordId || null)
                        // const metalSetting = await getMetalSetting(formik.values?.metalId, newValue?.recordId)
                        // formik.setFieldValue('factor', metalSetting?.rate || 0)
                      }}
                      error={formik.touched?.metalColorId && Boolean(formik.errors?.metalColorId)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='factor'
                      label={labels.factor}
                      value={formik.values.factor}
                      required
                      readOnly
                      onChange={e => {
                        formik.setFieldValue('suggestedWgt', (formik.values.netWgt || 0) * (e.target.value || 0) || 0)
                        formik.setFieldValue('factor', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('factor', 0)}
                      error={formik.touched.factor && Boolean(formik.errors.factor)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='stdLossRate'
                      label={labels.standardLoss}
                      value={formik.values.stdLossRate}
                      required
                      readOnly={isCancelled || isPosted}
                      onChange={e => {
                        formik.setFieldValue(
                          'lossVariationPct',
                          (formik.values.lossPct || 0) - (e.target.value || 0) || 0
                        )
                        formik.setFieldValue('stdLossRate', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('stdLossRate', 0)}
                      error={formik.touched.stdLossRate && Boolean(formik.errors.stdLossRate)}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={ManufacturingRepository.Labor.qry}
                      parameters={`_startAt=0&_pageSize=200&_params=`}
                      filter={labor => labor.workCenterId == castingWorkCenterId}
                      name='laborId'
                      label={labels.labor}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      readOnly={isPosted || isCancelled}
                      valueField='recordId'
                      required
                      displayField='name'
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('laborId', newValue?.recordId || null)
                      }}
                      error={formik.touched.laborId && Boolean(formik.errors.laborId)}
                    />
                  </Grid>
                  <Grid item>
                    <ResourceComboBox
                      endpointId={ManufacturingRepository.ProductionLine.qry}
                      parameters='_startAt=0&_pageSize=1000'
                      values={formik.values}
                      name='lineId'
                      label={labels.productionLine}
                      readOnly
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('lineId', newValue?.recordId || null)
                      }}
                      error={formik.touched.lineId && formik.errors.lineId}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container direction='column' spacing={2}>
                  <Grid item>
                    <CustomNumberField
                      name='grossWgt'
                      label={labels.grossWgt}
                      value={formik.values.grossWgt}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('grossWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('grossWgt', 0)}
                      error={formik.touched.grossWgt && Boolean(formik.errors.grossWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='rmWgt'
                      label={labels.rmWgt}
                      value={formik.values.rmWgt}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('rmWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('rmWgt', 0)}
                      error={formik.touched.rmWgt && Boolean(formik.errors.rmWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='mouldWgt'
                      label={labels.mouldWgt}
                      value={formik.values.mouldWgt}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('mouldWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('mouldWgt', 0)}
                      error={formik.touched.mouldWgt && Boolean(formik.errors.mouldWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='netWgt'
                      label={labels.netWgt}
                      value={formik.values.netWgt}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('netWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('netWgt', 0)}
                      error={formik.touched.netWgt && Boolean(formik.errors.netWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='suggestedWgt'
                      label={labels.suggestedWgt}
                      value={formik.values.suggestedWgt}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('suggestedWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('suggestedWgt', 0)}
                      error={formik.touched.suggestedWgt && Boolean(formik.errors.suggestedWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='inputWgt'
                      label={labels.inputWgt}
                      value={formik.values.inputWgt}
                      required
                      readOnly={isPosted || isCancelled}
                      onChange={e => {
                        formik.setFieldValue('inputWgt', e.target.value)
                        let netInput = (e.target.value || 0) + (formik.values.rmWgt || 0)
                        formik.setFieldValue('netInputWgt', netInput || 0)
                      }}
                      onClear={() => formik.setFieldValue('inputWgt', 0)}
                      error={formik.touched.inputWgt && Boolean(formik.errors.inputWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='netInputWgt'
                      label={labels.netInputWgt}
                      value={formik.values.netInputWgt}
                      required
                      readOnly
                      onChange={e => {
                        formik.setFieldValue(
                          'loss',
                          (formik.values.netInputWgt || 0) - (formik.values.outputWgt || 0) || 0
                        )
                        formik.setFieldValue('netInputWgt', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('netInputWgt', 0)}
                      error={formik.touched.netInputWgt && Boolean(formik.errors.netInputWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='outputWgt'
                      label={labels.outputWgt}
                      value={formik.values.outputWgt}
                      required
                      readOnly={isPosted || isCancelled}
                      onChange={e => {
                        var loss = (formik.values.netInputWgt || 0) - (e.target.value || 0)
                        formik.setFieldValue('loss', loss || 0)

                        //formik.setFieldValue('outputWgtBB', loss||0)
                        formik.setFieldValue('outputWgt', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('outputWgt', 0)}
                      error={formik.touched.outputWgt && Boolean(formik.errors.outputWgt)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='loss'
                      label={labels.loss}
                      value={formik.values.loss}
                      required
                      readOnly
                      onChange={e => {
                        formik.setFieldValue(
                          'lossPct',
                          (100 * (formik.values.loss || 0)) / (formik.values.netInputWgt || 0) || 0
                        )
                        formik.setFieldValue('loss', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('loss', 0)}
                      error={formik.touched.loss && Boolean(formik.errors.loss)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='lossPct'
                      label={labels.lossPct}
                      value={formik.values.lossPct}
                      required
                      readOnly
                      onChange={e => {
                        formik.setFieldValue(
                          'lossVariationPct',
                          (formik.values.lossPct || 0) - (formik.values.stdLossRate || 0) || 0
                        )
                        formik.setFieldValue('lossPct', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('lossPct', 0)}
                      error={formik.touched.lossPct && Boolean(formik.errors.lossPct)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='lossVariationPct'
                      label={labels.lossVariation}
                      value={formik.values.lossVariationPct}
                      required
                      readOnly
                      onChange={e => formik.setFieldValue('lossVariationPct', e.target.value)}
                      onClear={() => formik.setFieldValue('lossVariationPct', 0)}
                      error={formik.touched.lossVariationPct && Boolean(formik.errors.lossVariationPct)}
                    />
                  </Grid>
                  <Grid item>
                    <CustomNumberField
                      name='scrapWgt'
                      label={labels.scrapWgt}
                      value={formik.values.scrapWgt}
                      readOnly
                      onChange={e => formik.setFieldValue('scrapWgt', e.target.value)}
                      onClear={() => formik.setFieldValue('scrapWgt', 0)}
                      error={formik.touched.scrapWgt && Boolean(formik.errors.scrapWgt)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
