import {sendAPI} from './api.js';

import {downloadFile} from "@/helpers/downloadFile.js";

const defaultValues = (cb)=>{
    sendAPI(
        'get',
        '/economics/default_values/',
        null,
        cb
    )
}

const model = {
    add(mining_object_group, cb, cbErr){
        sendAPI(
            'post',
            '/economics/economic_models/',
            {mining_object_group},
            cb,
            cbErr
        )
    },
    get(modelId, cb, cbErr){
        sendAPI(
            'get',
            `/economics/economic_models/${modelId}/`,
            null,
            cb,
            cbErr
        )
    },
    edit(modelId, obj){
        sendAPI(
            'patch',
            `/economics/economic_models/${modelId}/`,
            obj
        )
    },
    calculate(id, cb, cbErr){
        sendAPI(
            'post',
            `/economics/economic_models/${id}/calculate/`,
            null,
            cb,
            cbErr
        ) 
    },
    data: {
        get: {
            input(
                id,
                cb,
                cbErr 
            ){
                sendAPI(
                    'get',
                    `/economics/economic_models/${id}/read_input_data/`,
                    null,
                    cb,
                    cbErr
                )
            },
            chart(
                id,
                cb,
                cbErr
            ){
                sendAPI(
                    'get',
                    `/economics/economic_models/${id}/get_total_output_data/`,
                    {bins: 32},
                    cb,
                    cbErr
                )
            },
            output(
                id, 
                perc, //[[10,90], [...], ...]
                cb,
                cbErr 
            ){
                const percentiles = perc.map(e => `p${e[0]}p${e[1]}`).join('-');

                sendAPI(
                    'get',
                    `/economics/economic_models/${id}/get_output_data/?percentiles=${percentiles}`,
                    null,
                    cb,
                    cbErr
                )
            }
        },
        set: {
            input(
                id, 
                colname,
                data,
                cb,
                cbErr 
            ){
                sendAPI(
                    'post',
                    `/economics/economic_models/${id}/set_economic_input_value/?colname=${colname}`,
                    {data},
                    cb,
                    cbErr
                )
            }
        },
        downloadReport(
            id, 
            name,
            perc, //[[10,90], [...], ...]
            cb, 
            cbErr
        ){
            sendAPI(
                'get', 
                `/economics/economic_models/${id}/download_excel/`, 
                {
                    format: 'json',
                    percentiles: perc.map(e => `p${e[0]}p${e[1]}`).join('-')
                },
                response => downloadFile(response, `Отчет, ${name}.xlsx`, cb),
                cbErr,
                null,
                'blob'
            )
        }
    }
}

export default {
    defaultValues,
    model
}