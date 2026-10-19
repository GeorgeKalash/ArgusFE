import { useContext, useEffect, useMemo, useState, Fragment } from 'react'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { KVSRepository } from '@argus/repositories/src/repositories/KVSRepository'
import styles from './Navigation.module.css'

const groupByModule = (guides, section) => {
  const map = new Map()

  guides.forEach(g => {
    if (!map.has(g.moduleId)) {
      map.set(g.moduleId, { key: `${section}-${g.moduleId}`, moduleName: g.moduleName, guides: [] })
    }
    map.get(g.moduleId).guides.push(g)
  })

  return [...map.values()].map(m => ({ ...m, guides: m.guides.sort((a, b) => a.seqNo - b.seqNo) }))
}

const ModuleRow = ({ group, selected, onSelect }) => (
  <div
    className={`${styles.releaseModule} ${selected ? styles.releaseModuleActive : ''}`}
    onClick={() => onSelect(group.key)}
  >
    <span>{group.moduleName}</span>
    <span className={styles.releaseModuleCount}>{group.guides.length}</span>
  </div>
)

const NotificationRing = ({ labels = {} }) => {
  const { getRequest } = useContext(RequestsContext)
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [seenRelease, setSeenRelease] = useState(null)
  const [pack, setPack] = useState({ release: null, activeModuleGuides: [], inactiveModuleGuides: [] })

  const storageKey = `seenRelease:${auth?.user?.username || 'user'}`
  const releaseNo = pack.release?.release || null
  const isSeen = Boolean(releaseNo) && seenRelease === releaseNo

  useEffect(() => {
    try {
      setSeenRelease(localStorage.getItem(storageKey))
    } catch (e) {
    }
  }, [storageKey])

  useEffect(() => {
    getRequest({
      extension: KVSRepository.getLatestReleasePack,
      parameters: ''
    })
      .then(res => {
        const data = res?.record || {}
        const active = data.activeModuleGuides || []
        setPack({
          release: data.release || null,
          activeModuleGuides: active,
          inactiveModuleGuides: data.inactiveModuleGuides || []
        })
        if (active.length === 0) setShowOther(true)
      })
      .catch(() => {})
  }, [])

  const activeGroups = useMemo(() => groupByModule(pack.activeModuleGuides, 'active'), [pack.activeModuleGuides])
  const inactiveGroups = useMemo(() => groupByModule(pack.inactiveModuleGuides, 'inactive'), [pack.inactiveModuleGuides])

  const allGroups = [...activeGroups, ...inactiveGroups]
  const selected = allGroups.find(g => g.key === selectedKey) || allGroups[0]

  if (allGroups.length === 0) return null

  const handleOpen = () => {
    setOpen(true)

    if (releaseNo) {
        setSeenRelease(releaseNo)
        localStorage.setItem(storageKey, releaseNo)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setMaximized(false)
  }

  return (
    <Fragment>
      <Badge
        color='error'
        badgeContent={pack.activeModuleGuides.length}
        invisible={isSeen}
        max={9}
        overlap='circular'
        onClick={handleOpen}
        className={`${styles.userDropdownIcon} ${styles.releaseRing}`}
      >
        <Icon icon='mdi:bell-outline' color='white' fontSize='1.8rem' />
      </Badge>

      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return
          handleClose()
        }}
        maxWidth={false}
        classes={{ paper: `${styles.releaseDialog} ${maximized ? styles.releaseDialogMax : ''}` }}
      >
        <div className={styles.releaseHeader}>
          <Typography className={styles.releaseHeaderTitle}>
            {labels.whatsNew}
            {releaseNo ? ` ${releaseNo}` : ''}
          </Typography>

          <div className={styles.releaseActions}>
            <div className={styles.releaseClose} onClick={() => setMaximized(prev => !prev)}>
              <Icon icon={maximized ? 'mdi:arrow-collapse-all' : 'mdi:arrow-expand-all'} fontSize='1.3rem' />
            </div>
            <div className={styles.releaseClose} onClick={handleClose}>
              <Icon icon='mdi:close' fontSize='1.3rem' />
            </div>
          </div>
        </div>

        <div className={styles.releaseBody}>
          <div className={styles.releaseSide}>
            {activeGroups.map(g => (
              <ModuleRow key={g.key} group={g} selected={selected?.key === g.key} onSelect={setSelectedKey} />
            ))}

            {inactiveGroups.length > 0 && (
              <div className={activeGroups.length > 0 ? styles.releaseOther : undefined}>
                <div className={styles.releaseOtherToggle} onClick={() => setShowOther(prev => !prev)}>
                  <span>{labels.otherModules}</span>
                  <Icon icon={showOther ? 'mdi:chevron-up' : 'mdi:chevron-down'} fontSize='1.2rem' />
                </div>

                {showOther &&
                  inactiveGroups.map(g => (
                    <ModuleRow key={g.key} group={g} selected={selected?.key === g.key} onSelect={setSelectedKey} />
                  ))}
              </div>
            )}
          </div>

          <div className={styles.releaseDetail} key={selected?.key}>
            <Typography className={styles.releaseDetailTitle}>{selected?.moduleName}</Typography>

            {selected?.guides.map(item => (
              <div key={`${item.moduleId}-${item.seqNo}`} className={styles.releaseItem}>
                <Typography className={styles.releaseSubject}>{item.subject}</Typography>
                <Typography className={styles.releaseGuide}>{item.guide}</Typography>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </Fragment>
  )
}

export default NotificationRing