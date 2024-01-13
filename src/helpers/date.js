export const beautifyDate = (date, noFormat)=>{
    const now = new Date();
    let res = '';

    const addZero = (num)=>{
        return  `${num<10?'0':''}${num}`
    }

    let year = false;
    
    if(!noFormat && now - date <= 86400000 && now >= date){
        res += 'Сегодня, ';
    }else if(!noFormat && now - date <= 86400000*2 && now >= date){
        res += 'Вчера, ';
    }else{
        year = true;
    }

    res += addZero(date.getDate())+'.'+addZero(date.getMonth() + 1);
    
    if(year){
        res += '.'+date.getFullYear()
    }

    return res;
}