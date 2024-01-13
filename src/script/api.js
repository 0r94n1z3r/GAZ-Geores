import { getCookie } from '@/script/cookie.js';
import axios from 'axios';
import config from "@/config.json";

import { useUserStore } from '@/stores/user.js';

export const api = config.api;

export const sendAPI = (method, url, data, cb=()=>{}, errCb=()=>{}, contentType, responseType)=>{
    if(data && data.token != null)data.token = getCookie('token');

    let body = {
        method,
        url: api + url,
        headers: {
            'authorization': getCookie('token') && 'Bearer ' + getCookie('token'),
            'Content-Type': contentType || 'application/json'
        },
        responseType: responseType || 'json'
    }

    if(method.toLowerCase() == 'get'){
        body.params = data;
    }else{
        body.data = data;
    }

    axios(body)
    .then((resp) => {
        cb(resp.data);
    })
    .catch((err) => {
        if(err?.response?.status == 401)useUserStore().refresh(()=>sendAPI(method, url, data, cb, errCb));
        
        errCb(parseError(err));
    })
}

const parseError = (err)=>{
    let data = err.response?.data;
    if(!data)return err;

    let res = data.detail ||
    data.non_field_errors?.[0] || 
    data;

    console.log(data);

    return res;
}
