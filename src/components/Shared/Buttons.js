export const Buttons = [

    {
        title:'Invoice',
        condition:'onTFR && visibleTFR',
        onClick:'onTFR',
        color:'#231f20',
        disabled:'!isTFR',
        image:'invoice.png',
    },
    {
        title:'Clear',
        condition:'onClear',
        onClick:'onClear',
        color:'#f44336',
        image:'clear.png',
    },
    {
        title:'Client Relation',
        condition:'clientRelation',
        onClick:'onClientRelation',
        color:'#AC48AE',
        disabled:'!editMode',
        image:'clientRelations.png',
    },
    {
        title:'GL',
        condition:'NewComponentVisible',
        onClick:'() => newHandler(recordId)',
        color:'#231f20',
        disabled:'!editMode',
        image:'gl.png',
    },
    {
        title:'Info',
        condition:'onInfo && infoVisible',
        onClick:'onInfo',
        color:'#231f20',
        disabled:'!editMode',
        image:'info.png',
    },
    {
        title:'Post',
        condition:'onPost && postVisible',
        onClick:'onPost',
        color:'#231f20',
        disabled:'isPosted || !editMode',
        image:'post.png',
    },
    {
        title:'Submit',
        condition:'onSave',
        onClick:'onSave',
        color:'#4eb558',
        disabled:'disabledSubmit || isPosted || isClosed',
        image:'save.png',
    },
    {
        title:'Apply',
        condition:'onApply',
        onClick:'onApply',
        color:'#4eb558',
        disabled:'disabledApply',
        image:'apply.png',
    },

]
