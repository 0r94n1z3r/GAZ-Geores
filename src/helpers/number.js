export const round = (
    num, 
    dec, 
    options /*splitThree, constantDecimal*/
)=>{
    num = parseFloat(num||0);;
    dec = dec||0;

    let numArr = num.toFixed(dec).split('.');
    let fract = (parseFloat('.'+numArr[1])+'').slice(2);

    if(options?.splitThree){
        numArr[0] = numArr[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    if(dec == 0)return numArr[0];

    if(options?.constantDecimal){
        fract = numArr[1]
    }

    return `${numArr[0]}${fract?'.':''}${fract||''}`;
}