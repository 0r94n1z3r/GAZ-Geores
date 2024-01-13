import {sendAPI} from './api.js';

import {downloadFile} from "@/helpers/downloadFile.js";

const defaultValues = (cb)=>{
    sendAPI(
        'get',
        '/conceptual_engineering/default_values/',
        null,
        cb
    )
}

const regions = (cb)=>{
    sendAPI(
        'get',
        '/conceptual_engineering/specific_costs/',
        null,
        cb
    )
}

const model = {
    add(mining_object_group, specific_cost, cb, cbErr){
        sendAPI(
            'post',
            '/conceptual_engineering/cost_models/',
            {mining_object_group, specific_cost},
            cb,
            cbErr
        )
    },
    get(modelId, cb, cbErr){
        sendAPI(
            'get',
            `/conceptual_engineering/cost_models/${modelId}/`,
            null,
            cb,
            cbErr
        )
    },
    calculate(id, cb, cbErr){
        sendAPI(
            'post',
            `/conceptual_engineering/cost_models/${id}/calculate/`,
            null,
            cb,
            cbErr
        )
    },
    delete(id, cb, cbErr){
        sendAPI(
            'delete',
            `/conceptual_engineering/cost_models/${id}/`,
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
                    `/conceptual_engineering/cost_models/${id}/read_input_data/`,
                    null,
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
                    `/conceptual_engineering/cost_models/${id}/get_cost_output_data/?percentiles=${percentiles}`,
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
                value,
                cb,
                cbErr 
            ){
                sendAPI(
                    'post',
                    `/conceptual_engineering/cost_models/${id}/set_cost_input_value/?colname=${colname}`,
                    {value},
                    cb,
                    cbErr
                )
            }
        },
    }
}

export default {
    defaultValues,
    regions,
    model
};