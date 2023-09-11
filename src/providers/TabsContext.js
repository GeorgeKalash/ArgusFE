// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'


// ** MUI Imports
import {
    Tabs,
    Tab,
    Typography,
    Box,
} from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'

const TabsContext = createContext()

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box sx={{ p: 3 }}>
                <Typography>{children}</Typography>
            </Box>
        </div>
    )
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
}

const TabsProvider = ({ children }) => {
    // ** Hooks
    const router = useRouter()

    const getLabel = () => {
        const parts = router.route.split('/')

        return parts[parts.length - 1]
    }

    // ** States
    const [activeTabs, setActiveTabs] = useState([{ page: children, route: router.route, label: getLabel() }])
    const [value, setValue] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    const closeTab = (tabRoute) => {
        setActiveTabs(prevState => {
            const index = prevState.findIndex((tab) => tab.route === tabRoute)
            if (index === value) {
                const newValue = index > 0 ? index - 1 : 0
                setValue(newValue)
            } else if (value === prevState.length - 1) {
                setValue(prevState.length - 2)
            }

            return prevState.filter((tab) => tab.route !== tabRoute)
        })
    }

    useEffect(() => {
        setActiveTabs(prevState => {

            if (prevState.some(activeTab => activeTab.page === children || activeTab.route === router.route))
                return prevState
            else {
                setValue(prevState.length)

                return [
                    ...prevState,
                    { page: children, route: router.route, label: getLabel() }
                ]
            }
        })
    }, [children])

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        {activeTabs.map((activeTab, i) => (
                            <Tab
                                key={i}
                                label={activeTab.label}
                                onClick={() => router.push(activeTab.route)}
                                icon={
                                    <IconButton
                                        size="small"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            closeTab(activeTab.route)
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                }
                                iconPosition="end"
                            />
                        ))}
                    </Tabs>
                </Box>
                {activeTabs.map((activeTab, i) => (

                    <CustomTabPanel key={i} index={i} value={value}>
                        {activeTab.page}
                    </CustomTabPanel>
                ))}
            </Box>
        </>
    )
}

export { TabsContext, TabsProvider }
