import React, { useEffect, useContext } from 'react'
import FormShell from './FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useFormik } from 'formik'
import CustomTextField from '../Inputs/CustomTextField'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { DataGrid } from './DataGrid'
import * as yup from 'yup'
import { Grow } from './Layouts/Grow'
import { Fixed } from './Layouts/Fixed'
import { VertLayout } from './Layouts/VertLayout'

export const ClientRelationForm = ({ recordId, name, reference, setErrorMessage }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.ClientRelation
  })

  useEffect(() => {
    getGridData(recordId)
  }, [recordId])

  function getGridData(parentId) {
    formik.setValues({
      relations: [
        {
          id: 1,
          parentId: recordId || '',
          clientId: '',
          clientName: '',
          relationName: '',
          clientRef: '',
          seqNo: 1,
          rtId: '',
          rtReference: '',
          expiryDate: '',
          activationDate: ''
        }
      ]
    })
    var parameters = `_parentId=${parentId}`

    getRequest({
      extension: RTCLRepository.ClientRelation.qry,
      parameters: parameters
    })
      .then(res => {
        const result = res.list

        const processedData = result.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1,
          activationDate: formatDateFromApi(item?.activationDate),
          expiryDate: formatDateFromApi(item?.expiryDate)
        }))
        res.list.length > 0 && formik.setValues({ relations: processedData })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: _labels.clientRef,
      name: 'clientRef',
      props: {
        endpointId: CTCLRepository.CtClientIndividual.snapshot,
        parameters: { _category: 1, _size: 30 },
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'recordId', to: 'clientId' },
          { from: 'reference', to: 'clientRef' },
          { from: 'name', to: 'clientName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: _labels.clientName,
      name: 'clientName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: _labels.relation,
      name: 'relationName',
      props: {
        endpointId: CurrencyTradingSettingsRepository.RelationType.qry,
        parameters: { _dgId: 0 },
        valueField: 'recordId',
        displayField: 'name',
        widthDropDown: 200,
        mapping: [
          { from: 'recordId', to: 'rtId' },
          { from: 'name', to: 'relationName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },

    {
      component: 'date',
      label: _labels.expiryDate,
      name: 'expiryDate'
    },

    {
      component: 'date',
      label: _labels.activationDate,
      name: 'activationDate'
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      relations: yup
        .array()
        .of(
          yup.object().shape({
            clientRef: yup.string().required('currency  is required'),
            relationName: yup.string().required('Country  is required'),
            expiryDate: yup.string().required('Dispersal Type  is required'),
            activationDate: yup.string().required('plantId Type  is required')
          })
        )
        .required('schedules array is required')
    }),
    initialValues: {
      relations: [
        {
          id: 1,
          parentId: recordId,
          clientId: '',
          name: '',
          reference: '',
          seqNo: 1,
          rtId: '',
          rtReference: '',
          expiryDate: '',
          activationDate: ''
        }
      ]
    },
    onSubmit: async values => {
      await post(values)
    }
  })

  const post = async obj => {
    const res = obj.relations.map(({ parentId, activationDate, expiryDate, ...rest }, index) => ({
      parentId: recordId,
      seqNo: index + 1,
      activationDate: activationDate && formatDateToApiFunction(activationDate),
      expiryDate: expiryDate && formatDateToApiFunction(expiryDate),
      ...rest
    }))

    const data = {
      parentId: recordId,
      items: res
    }

    await postRequest({
      extension: RTCLRepository.ClientRelation.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} infoVisible={false}>
      <VertLayout>
        <Fixed>
          <Grid container xs={9} spacing={4} sx={{ p: 5 }}>
            <Grid item xs={4}>
              <CustomTextField value={reference} label={_labels.reference} readOnly={true} />
            </Grid>{' '}
            <Grid item xs={5}></Grid>
            <Grid item xs={6}>
              <CustomTextField value={name} label={_labels.client} readOnly={true} />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('relations', value)}
            value={formik.values.relations}
            error={formik.errors.relations}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
