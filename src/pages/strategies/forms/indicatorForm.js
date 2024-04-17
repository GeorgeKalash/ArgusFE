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
  recordId,
  store,

  setStore,
  onApply
}) => {
  const handleApply = () => {
    if (onApply) {
      onApply(strategiesFormik.values)
    }
  }

  const [valueGridData, setValueGridData] = useState()
  const { postRequest } = useContext(RequestsContext)
  const [refresh, setRefresh] = useState(false)
  const { getRequest } = useContext(RequestsContext)

  // const gid = strategiesFormik.values.recordId

  const formik = useFormik({
    initialValues: {
      strategyId: 28,
      indicatorData: [
        {
          id: 1,
          codeId: 1,

          seqNo: '',

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
      console.log(strategiesFormik.values.recordId)
    }
  })

  const submitIndicators = obj => {
    if (obj.length === 0) {
      console.error('No data to submit')

      return
    }

    const firstItem = obj

    obj = obj.map(({ strategyId, ...rest }, index) => ({
      strategyId: 28,

      ...rest
    }))

    console.log('strategiesFormik.values:', strategiesFormik.values)
    postRequest({
      extension: DocumentReleaseRepository.StrategyIndicator.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
        getCountries(recordId)
      })
      .catch(error => {})
  }

  const getValueGridData = recordId => {
    getRequest({
      extension: DocumentReleaseRepository.StrategyIndicator.qry,
      parameters: `_strategyId=${recordId}`
    })
      .then(res => {
        setValueGridData(res)
        console.log('resss', res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(() => {
    recordId && getValueGridData(recordId)
  }, [recordId, refresh])

  const applyStrategy = async obj => {
    try {
      const res2 = await postRequest({
        extension: DocumentReleaseRepository.Strategy.apply,
        record: JSON.stringify(obj)
      })

      toast.success('Strategy Applied Successfully')
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

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Strategies}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow: 'hidden' }}>
        <DataGrid
          onChange={value => formik.setFieldValue('indicatorData', value)}
          value={formik.values.indicatorData}
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

// const [initialValues, setInitialData] = useState({
//   recordId: formValues.recordId,
//   reference: formValues.reference,
//   date: formValues.date,
//   functionId: functionId,
//   seqNo: '',

//   generalAccount: [
//     {
//       id: 1,

//       accountRef: '',
//       accountId: '',
//       accountName: '',

//       tpAccountId: '',
//       tpAccountRef: '',
//       tpAccountName: '',
//       currencyRef: '',
//       currencyId: '',

//       sign: '',
//       signName: '',
//       notes: '',
//       functionId: functionId,
//       exRate: '',
//       amount: '',
//       baseAmount: ''
//     }
//   ]
// })

// const formik2 = useFormik({
//   initialValues,
//   enableReinitialize: true,

//   validationSchema: yup.object({
//     generalAccount: yup
//       .array()
//       .of(
//         yup.object().shape({
//           accountRef: yup.string().required('accountRef recordId is required'),
//           accountName: yup.string().required('currencyId recordId is required'),
//           accountId: yup.number().required('currencyId recordId is required'),

//           currencyRef: yup.string().required('currencyId recordId is required'),
//           signName: yup.string().required('currencyId recordId is required'),
//           amount: yup.number().required('currencyId recordId is required'),
//           baseAmount: yup.number().required('currencyId recordId is required'),
//           exRate: yup.number().required('currencyId recordId is required')
//         })
//       )
//       .required('generalAccount array is required')
//   }),
//   validateOnChange: true,
//   onSubmit: async values => {
//     {
//       console.log('recordId', formik2.values.recordId)
//       console.log('general', values.generalAccount)

//       const data = {
//         transactions: values.generalAccount.map(({ id, exRate, tpAccount, functionId, ...rest }) => ({
//           seqNo: id,

//           exRate,

//           functionId,
//           rateCalcMethod: 1,

//           ...rest
//         })),
//         date: formatDateToApi(values.date),
//         functionId: values.functionId,
//         recordId: formValues.recordId,
//         reference: values.reference
//       }

//       console.log('Submitting data:', data)

//       const response = await postRequest({
//         extension: GeneralLedgerRepository.GeneralLedger.set2,
//         record: JSON.stringify(data)
//       })

//       console.log('Submission response:', response)

//       toast.success('Record Added Successfully')
//     }
//   }
// })
