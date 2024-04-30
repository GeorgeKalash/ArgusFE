import React, { useState, useEffect, useContext } from 'react'
import { Box, Button } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'

const IndicatorForm = ({
  labels,

  expanded,
  editMode,
  height,
  maxAccess,
  store,
  onApply,
  setStore
}) => {
  const [valueGridData, setValueGridData] = useState([])
  const { postRequest } = useContext(RequestsContext)

  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const [applyTrigger, setApplyTrigger] = useState(0)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      indicatorData: [
        {
          id: 1,

          strategyId: recordId,
          seqNo: '',
          codeId: '',
          name: '',
          indicatorId: '',
          indicatorName: ''
        }
      ]
    },

    validationSchema: yup.object({
      indicatorData: yup
        .array()
        .of(
          yup.object()?.shape({
            indicatorName: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: values => {
      submitIndicators(values.indicatorData)
    }
  })

  const submitIndicators = obj => {
    if (obj.length === 0) {
      return
    }

    const requests = obj.map(item => {
      const { id, indicatorRef, indicatorName, ...itemWithoutId } = item
      itemWithoutId.strategyId = recordId

      return postRequest({
        extension: DocumentReleaseRepository.StrategyIndicator.set,
        record: JSON.stringify(itemWithoutId)
      })
    })

    Promise.all(requests)
      .then(results => {
        toast.success('Records Edited Successfully')
      })
      .catch(error => {
        toast.error('An error occurred while editing records')
      })
  }

  const getValueGridData = recordId => {
    getRequest({
      extension: DocumentReleaseRepository.StrategyIndicator.qry,
      parameters: `_strategyId=${recordId}`
    })
      .then(res => {
        const gridData = res.list.map((item, index) => ({
          id: index + 1,
          ...item,
          strtategyId: item.strategyId
        }))
        setValueGridData(gridData)
        formik.setValues({ indicatorData: gridData })
      })
      .catch(error => {
        console.error('Error fetching grid data:', error)
      })
  }

  useEffect(() => {
    if (recordId) {
      getValueGridData(recordId)
    }
  }, [recordId, applyTrigger])

  const applyStrategy = async () => {
    try {
      const { groupName, ...valuesWithoutGroupName } = store

      const res = await postRequest({
        extension: DocumentReleaseRepository.ApplySTG.apply,
        record: JSON.stringify(valuesWithoutGroupName)
      })
      toast.success('Strategy Applied Successfully')

      setApplyTrigger(prev => prev + 1)
    } catch (error) {
      toast.error('An error occurred during apply')
    }
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'seqNo',
      min: 1
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.indicator,

      name: 'indicatorName',
      props: {
        endpointId: DocumentReleaseRepository.ReleaseIndicator.qry,
        parameters: `_startAt=0&_pageSize=50`,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'name', to: 'indicatorName' },
          { from: 'reference', to: 'indicatorRef' },
          { from: 'recordId', to: 'indicatorId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Ref' },
          { key: 'name', value: 'Name' }
        ]
      }
    }
  ]

  const actions = [
    {
      key: 'Apply',
      condition: true,
      onClick: () => {
        applyStrategy()
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Strategies}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
      actions={actions}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow: 'hidden' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('indicatorData', value)}
          value={formik.values.indicatorData}
          error={formik.errors.indicatorData}
          columns={columns}
          height={`${expanded ? `calc(100vh - 280px)` : `${height - 100}px`}`}
          allowDelete={false}
          allowAddNewLine={false}
        />
      </Box>
    </FormShell>
  )
}

export default IndicatorForm
