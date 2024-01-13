export const getBorders = (minval_closed, minval, maxval, maxval_closed)=>
    (minval != null || maxval != null)?
    `${minval_closed?'[':'('}${minval != null?minval:'-∞'};${maxval != null?maxval:'∞'}${maxval_closed?']':')'}`:
    null;