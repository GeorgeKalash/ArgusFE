import React, { useEffect, useContext, useState } from 'react'
import FormShell from './FormShell'
import InlineEditGrid from './InlineEditGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useFormik } from 'formik'
import CustomTextField from '../Inputs/CustomTextField'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import dayjs from 'dayjs'

import { formatDateDefault } from 'src/lib/date-helper'// import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'

export const ClientRelationForm = ({recordId, name , reference}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const[gridData , setGridData] = useState([])
  const[clientStore , setClientStore] = useState([])
  const [RelationTypesStore, setRelationTypesStore] =useState([])
  const [errorMessage, setErrorMessage] =useState([])

  const {
    labels: _labels,
    access
  } = useResourceParams({
    datasetId: ResourceIds.ClientRelation
  })

  useEffect(()=>{

    getGridData(recordId)
  },[recordId])

  useEffect(()=>{
    getFillRelationTypes()

  },[])

  function getGridData(parentId){

    formik.setValues({
      rows: [
        {
          parentId: recordId || '',
          clientId: '',
          clientName: '',
          relationName: '',
          clientRef: '',
          seqNo: 1,
          rtId: '',
          rtReference: '',
          expiryDate: '',
          activationDate: ''}
      ]
    })
    var parameters = `_parentId=${parentId}`;

    getRequest({
      extension: RTCLRepository.ClientRelation.qry,
      parameters: parameters,
    })
      .then((res) => {
        const result = res.list

        const processedData = result.map((item) => ({
          ...item,
          activationDate: formatDateDefault(item?.activationDate),
          expiryDate: formatDateDefault(item?.expiryDate)

        }));
        res.list.length > 0 && formik.setValues({rows: processedData});
      })
      .catch((error) => {
        // setErrorMessage(error);
      });
  }

//   const formatDateFromApi = (apiDate) => {
//     // Assuming the API date format is "/Date(1704758400000)/"
//     const timestamp = parseInt(apiDate.match(/\d+/)[0], 10);
//     const dateObject = new Date(timestamp);

// return dayjs(dateObject).format('YYYY-MM-DD');
//   };

  const lookupClient = inp => {
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp
     console.log({list: []})

     if(input){
    var parameters = `_size=30&_startAt=0&_filter=${input}&_category=1`

    getRequest({
      extension: CTCLRepository.CtClientIndividual.snapshot,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setClientStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })

    }else{

      setGridData({count : 0, list: [] , message :"",  statusId:1})
    }

  }




  const gridColumn = [
    {
      field: 'incremented',
      header: 'Seq No',
      name: 'seqNo',
      mandatory: false,
      readOnly: true,
      hidden: true,
      valueSetter: () => {
        return formik.values.rows.length + 1
      }
    },
    {
      field: 'lookup',
      header: _labels.clientRef,
      nameId: 'clientId',
      name: 'clientRef',
      mandatory: true,
      store: clientStore,
      valueField: 'recordId',
      displayField:  'name',
      widthDropDown: 200,
      fieldsToUpdate: [{ from: 'reference', to: 'clientRef' }, { from: 'name', to: 'clientName' }],
      columnsInDropDown: [
        { key: 'reference', value: 'reference' },
        { key: 'name', value: 'Name' }
      ],
       onLookup: lookupClient
    },
    {
      field: 'textfield',
      header: _labels.clientName,
      name: 'clientName',
      mandatory: true,
      readOnly: true
    },


    {
      field: 'combobox',
      header: _labels.relation,
      nameId: 'rtId',
      name: 'relationName',
      mandatory: true,
      store: RelationTypesStore ,
      valueField: 'recordId',
      displayField: 'reference',
      widthDropDown: 200,

      fieldsToUpdate: [{ from: 'name', to: 'name' }],
      columnsInDropDown: [
        { key: 'reference', value: 'Reference' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      id: 1,
      field: 'datePicker',
      header: _labels.expiryDate,
      name: 'expiryDate',
      mandatory: true,



    },
    {
      id: 1,
      field: 'datePicker',
      header: _labels.activationDate,
      mandatory: true,
      name: 'activationDate',
      cellRender: (rowData) =>{ return '666666'} // Index 6 is where 'activationDate' is in the columns array




    }
  ]


  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
        parentId: recordId,
        clientId: '',
        name: '',
        reference: '',
        seqNo: 1,
        rtId: '',
        rtReference: '',
        expiryDate: '',
        activationDate: ''}]
    },
    onSubmit: values => {
      console.log(values)
      post(values)
    }
  })

  const getFillRelationTypes = () => {
    const defaultParams = `_filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: CurrencyTradingSettingsRepository.RelationType.qry,
      parameters: parameters
    })
      .then(res => {
        setRelationTypesStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const post = obj => {
    const data = {
      parentId: recordId,
      items: obj.rows
    }

    console.log(data)
    postRequest({
      extension: RTCLRepository.ClientRelation.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

return (
    <FormShell height={500} form={formik} infoVisible={false}>
      <Grid container xs={9}  spacing={4} sx={{p:5}}>
        <Grid item xs={4}><CustomTextField value={reference} label={_labels.reference} readOnly={true}/></Grid> <Grid item xs={5}></Grid>
        <Grid item xs={6}><CustomTextField value={name} label={_labels.client}   readOnly={true} /></Grid>
      </Grid>
      <Grid  spacing={4} sx={{mt: 5}}>
      <InlineEditGrid
      gridValidation={formik}
      columns={gridColumn}
      defaultRow={{
        parentId: recordId || '',
        clientId: '',
        clientName: '',
        clientRef: '',
        relationName: '',
        seqNo: '' ,
        rtId: '',
        expiryDate: '',
        activationDate: ''
      }}
        allowAddNewLine={true}
        allowDelete={true}
      />
      </Grid>
    </FormShell>
  )
}
