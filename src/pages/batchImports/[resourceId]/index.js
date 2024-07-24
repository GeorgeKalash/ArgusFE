import { useRouter } from 'next/router'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Box, Button } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from 'src/components/Shared/Buttons'
import { useResourceQuery } from 'src/hooks/resource'
import toast from 'react-hot-toast'
import { formatDateDefault } from 'src/lib/date-helper'
import { ProgressForm } from 'src/components/Shared/Progress'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'

const BatchImports = () => {
    const { stack } = useWindow()
    const { stack: stackError } = useError()
    const router = useRouter()

    const [state, setState] = useState({
      columns: [],
      gridData: [],
      name: '',
      objectName: '',
      endPoint: ''
    })

    const { getRequest, postRequest } = useContext(RequestsContext)
    const { resourceId } = router.query
    const { platformLabels } = useContext(ControlContext)
    const buttons = getButtons(platformLabels)
    const onClearButton = buttons.find(button => button.key === 'Clear')

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const timestamp = date.getTime();

      return `/Date(${timestamp})/`;
    };

    const formatDateForImport = (dateString) => {
      const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
      const fullYear = year < 100 ? 2000 + year : year;
      const date = new Date(Date.UTC(fullYear, month - 1, day, 0, 0, 0));

      return date.toISOString().split('.')[0] + 'Z';
    }

    const {
      access,
      invalidate
    } = useResourceQuery({
      datasetId: resourceId
    })

    useEffect(() => {
        ;(async function () {
          try {
            if (resourceId) {
              const res = await getRequest({
                extension: SystemRepository.ETL.get,
                parameters: `_resourceId=${resourceId}`
              })

              const modifiedFields = res.record.fields.map(({ name, ...rest }, index) => ({
                field: name,
                headerName: name,
                flex: 1,
                ...rest,
                columnIndex: index
              }))
                    
              setState(prevState => ({
                ...prevState,
                objectName: res.record.objectName,
                endPoint: res.record.endPoint,
                columns: [
                    { field: 'recordId', headerName: '', flex: .4 },
                    ...modifiedFields
                ]
              }));
            }
          } catch (exception) {}
        })()
      }, [resourceId])
      
      const handleFileChange = (event) => {
        const file = event.target.files[0]

        setState(prevState => ({
          ...prevState,
          name: file.name
        }));

        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = e.target.result
            parseCSV(text)
          }
          reader.readAsText(file)
        }
      }

      const transform = (array) => {
        return {
            count: array?.length > 0 ? array.length : 0,
            list: array?.length > 0 ? array.map((item, index) => ({
                ...item,
                recordId: index + 1,
                minPrice: item.minPrice || 0,
                maxAccess: item.mandatory
            })) : [],
            statusId: 1,
            message: "",
            _startAt: 0
        };
    }

    const convertValue = (value, dataType, isAPI = false) => {
      if (value === '') {
        return value;
      }
      switch (dataType) {
          case 2: 
            return parseInt(value, 10);
          case 3:
            return parseFloat(value);
          case 5:
            return isAPI 
              ? formatDateForImport(value) 
              : formatDateDefault(formatDate(value)); 
          default:
              return value;
      }
    }
    
    const parseCSV = (text) => {
      const lines = text.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        return;
      }
      
      const headers = lines[0].split(',').map(header => header.trim());
  
      const columnMap = state.columns.reduce((map, col) => {
        map[col.headerName] = col;

        return map;
      }, {})
  
      const orderedColumns = headers.map(header => columnMap[header]);

      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());

        return orderedColumns.reduce((obj, col, index) => {
          if (col) {
            obj[col.field] = convertValue(values[index], col.dataType);
          } else {
            obj[headers[index]] = values[index];
          }

          return obj
        }, {})
      })

      const dataFromCSV = transform(rows);
      setState(prevState => ({
        ...prevState,
        gridData: dataFromCSV
      }));
      refetch();
    }

    const clearFile = () => {
      setState(prevState => ({
        ...prevState,
        name: '',
        gridData: []
      }));
      document.getElementById('csvInput').value = null;
      refetch();
    };

    const refetch = () => {
        setState(prevState => {
            const transformedData = transform(prevState.gridData.list);

            return {
                ...prevState,
                gridData: transformedData
            };
        });
    };

    const getImportData = async () => {
      const mandatoryColumns = state.columns.filter(col => col.mandatory);
      const missingFields = [];

      for (const row of state.gridData.list) {
        for (const col of mandatoryColumns) {
          if (row[col.field] === null || row[col.field] === undefined || row[col.field] === '') {
            missingFields.push(col.headerName);
          }
        }
      }
    
      if (missingFields.length > 0) {
        const uniqueMissingFields = [...new Set(missingFields)];
        stackError({
          message: `${uniqueMissingFields.join(', ')} ${uniqueMissingFields.length > 1 ? 'are' : 'is'} mandatory field${uniqueMissingFields.length > 1 ? 's' : ''}.`
        });

        return;
      }
    
      const convertedData = state.gridData.list.map(row => {
        return Object.keys(row).reduce((acc, key) => {
          const col = state.columns.find(c => c.field === key);
          let value = row[key];
    
          if (value === '') {
            value = null;
          }
    
          if (col) {
            acc[key] = convertValue(value, col.dataType, true);
          } else {
            acc[key] = value;
          }
    
          return acc;
        }, {});
      });
    
      const data = {
        [state.objectName]: convertedData
      }
    
      try {
        const res = await postRequest({
          extension: state.endPoint,
          record: JSON.stringify(data)
        });
    
        stack({
          Component: ProgressForm,
          props: {
            recordId: res.recordId,
            access
          },
          width: 500,
          height: 450,
          title: platformLabels.Progress
        });
        invalidate();
        toast.success(platformLabels.Imported);
      } catch (exception) {}
    }
    

    return (
        <VertLayout>
            <Fixed>
                <GridToolbar>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <CustomTextField
                      name='name'
                      label={platformLabels.SelectCSV}
                      value={state.name}
                      readOnly={true}
                      disabled={!!state.name}
                    />
                    <Button
                      sx={{ ml: 2 }}
                      variant='contained'
                      size='small'
                      disabled={!!state.name}
                      onClick={() => document.getElementById('csvInput').click()}
                    >
                      {platformLabels.Browse}...
                    </Button>
                    <Button
                      onClick={clearFile}
                      variant='contained'
                      sx={{
                        mr: 1,
                        ml: 1,
                        backgroundColor: onClearButton.color,
                        '&:hover': {
                          backgroundColor: onClearButton.color,
                          opacity: 0.8
                        },
                        border: onClearButton.border,
                        width: '50px !important',
                        height: '35px',
                        objectFit: 'contain',
                        minWidth: '30px !important'
                      }}
                      disabled={!state.name}
                    >
                      <img src={`/images/buttonsIcons/${onClearButton.image}`} alt={onClearButton.key} />
                    </Button>
                    <input
                        id="csvInput"
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e)}
                    />
                  </Box>
                </GridToolbar>
            </Fixed>
            <Grow>
              <Table
                  columns={state.columns}
                  gridData={state.gridData}
                  refetch={refetch}
                  rowId={['recordId']}
                  isLoading={false}
                  pageSize={50}
                  paginationType='api'
                  pagination={false}
                  maxAccess={access}
                  textTransform={true}
              />
            </Grow>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: 7 }}>
              <Button
                variant='contained'
                sx={{
                  mr: 1,
                  ml: 3,
                  '&:hover': {
                    opacity: 0.8
                  },
                  height: '35px',
                  objectFit: 'contain',
                  minWidth: '30px !important'
                }}
                size='small'
                onClick={getImportData}
              >
                <img src={`/images/buttonsIcons/import.png`} alt={'Import'} />
              </Button>
            </Box>
        </VertLayout>
    )
}

export default BatchImports