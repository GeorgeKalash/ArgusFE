import React, { useState, useEffect, useContext } from 'react'
import { Box, Button } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'

import { ResourceIds } from 'src/resources/ResourceIds'
import { reference } from '@popperjs/core'
import Strategy from 'src/pages/strategies'

const IndicatorForm = ({
  labels,
  strategiesFormik,
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
  const [refresh, setRefresh] = useState(false)
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const formik = useFormik({
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

    // validationSchema: yup.object({
    //   indicatorData: yup
    //     .array()
    //     .of(
    //       yup.object().shape({
    //         seqNo: yup
    //           .number()
    //           .min(1, 'Sequence number must be greater than 0')
    //           .required('Sequence number is required'),
    //         name: yup.string().required('Indicator name is required'),
    //         indicatorId: yup.string().required('Indicator ID is required'),
    //         indicatorName: yup.string().required('Indicator ID is required')
    //       })
    //     )
    //     .required('Indicator data array is required')
    // }),
    onSubmit: values => {
      submitIndicators(values.indicatorData)

      console.log('strt', strategiesFormik.values)
    }
  })

  const submitIndicators = obj => {
    if (obj.length === 0) {
      console.error('No data to submit')

      return
    }

    obj = obj.map(item => {
      const { id, indicatorRef, indicatorName, ...itemWithoutId } = item
      itemWithoutId.strategyId = recordId
      postRequest({
        extension: DocumentReleaseRepository.StrategyIndicator.set,
        record: JSON.stringify(itemWithoutId)
      })
        .then(res => {
          if (res) toast.success('Record Edited Successfully')
        })
        .catch(error => {})
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
          seqNo: item.seqNo,
          name: item.name,
          indicatorName: item.indicatorName,
          indicatorId: item.indicatorId,
          codeId: item.codeId,
          strtategyId: item.strategyId
        }))
        setValueGridData(gridData)
      })
      .catch(error => {
        console.error(error)
        setErrorMessage(error)
      })
  }

  // useEffect(() => {
  //   recordId && getValueGridData(recordId)
  // }, [recordId, refresh])

  const applyStrategy = async () => {
    try {
      const { groupName, ...valuesWithoutGroupName } = strategiesFormik.values

      const res = await postRequest({
        extension: DocumentReleaseRepository.ApplySTG.apply,
        record: JSON.stringify(valuesWithoutGroupName)
      })
      toast.success('Strategy Applied Successfully')
      getValueGridData(store.recordId) // Refresh the grid data after applying the strategy
    } catch (error) {
      toast.error('An error occurred during apply')
    }
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! REMOOOOOOOOOVVVVVVVVVVEEEEEEEEEE UUUUUUUSSSSSSSSSEEEEEEEEEEE EEEEEFFFFFFFFEEEEEEEECCCCCTTTTTTTT
  // const applyStrategy = async () => {
  //   try {
  //     const { groupName, ...valuesWithoutGroupName } = strategiesFormik.values;

  //     const res = await postRequest({
  //       extension: DocumentReleaseRepository.ApplySTG.apply,
  //       record: JSON.stringify(valuesWithoutGroupName)
  //     });
  //     toast.success('Strategy Applied Successfully');
  //     getValueGridData(store.recordId); // Refresh the grid data after applying the strategy
  //   } catch (error) {
  //     toast.error('An error occurred during apply');
  //   }
  // }

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
      name: 'name'
    },
    {
      component: 'resourcecombobox',
      label: labels.indicator,

      name: 'indicatorName',
      props: {
        endpointId: DocumentReleaseRepository.ReleaseIndicator.qry,
        valueField: 'recordId',
        displayField: 'name',
        parameters: `_startAt=0&_pageSize=50`,
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
          value={valueGridData}
          error={formik.errors.indicatorData}
          columns={columns}
          height={`${expanded ? `calc(100vh - 280px)` : `${height - 100}px`}`}
          allowDelete={false}
        />
      </Box>
    </FormShell>
  )
}

export default IndicatorForm

// DR.asmx/applySTG
// {"name":"test react","groupId":1,"type":1,"recordId":"19"}
// DR.asmx/setSTG
// {"strategyId":20,"codeId":4,"seqNo":1,"indicatorId":3,"name":"Factory Manager"}
// {"strategyId":1,"codeId":1,"seqNo":2,"indicatorId":1,"name":"code 1"}
