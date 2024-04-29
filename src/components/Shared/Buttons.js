export const Buttons = [
  {
    key: 'Post',
    color: '#231f20',
    image: 'post.png',
    main: false
  },
  {
    key: 'Cancel',
    color: '#0A4164',
    image: 'cancelWhite.png',
    main: false
  },
  {
    key: 'WorkFlow',
    color: '#231f20',
    image: 'workflow.png',
    main: false
  },
  {
    key: 'Close',
    color: 'transparent',
    image: 'close.png',
    border: '1px solid #01a437',
    main: false
  },
  {
    key: 'Reopen',
    color: 'transparent',
    image: 'reopen.png',
    border: '1px solid #000000',
    main: false
  },
  {
    key: 'Approval',
    color: '#231f20',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Approve all',
    color: '#4EB558',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Dismiss all',
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Reject',
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Approve',
    color: '#4EB558',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Beneficiary',
    color: '#231f20',
    image: 'beneficiary.png',
    main: false
  },
  {
    key: 'Invoice',
    color: '#231f20',
    image: 'invoice.png',
    main: false
  },
  {
    key: 'Client Relation',
    color: '#AC48AE',
    image: 'clientRelations.png',
    main: false
  },
  {
    key: 'GL',
    color: '#231f20',
    image: 'gl.png',
    main: false
  },
  {
    key: 'Apply',
    condition: 'onApply',
    onClick: 'onApply',
    color: '#4eb558',
    disabled: 'disabledApply',
    image: 'apply.png',
    main: true
  },
  {
    key: 'Clear',
    condition: 'isCleared',
    onClick: 'onClear',
    color: '#f44336',
    image: 'clear.png',
    main: true
  },
  {
    key: 'RecordRemarks',
    condition: 'isRecordRemark',
    onClick: 'onRecordRemarks',
    color: '#90278e',
    disabled: '!editMode',
    image: 'notes.png',
    main: true
  },
  {
    key: 'Info',
    condition: 'isInfo && infoVisible',
    onClick: 'onInfo',
    color: '#4355a5',
    disabled: '!editMode',
    image: 'info.png',
    main: true
  },
  {
    key: 'Submit',
    condition: 'isSaved',
    onClick: 'onSave',
    color: '#4eb558',
    disabled: 'disabledSubmit || isPosted || isClosed',
    image: 'save.png',
    main: true
  }
]
