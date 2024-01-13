import {sendAPI} from './api.js';
import M from '@/stores/mining.js';
import { useProjectStore } from '@/stores/project.js';

import {downloadFile} from "@/helpers/downloadFile.js";

const defaultValues = (cb)=>{
    sendAPI(
        'get',
        '/mining/default_values/',
        null,
        cb
    )
}

const default_actions = (type)=>{
    return {
        add(obj, cb){
            sendAPI(
                'post',
                `/mining/${type}/`,
                obj,
                cb
            )
        },
        get(id, cb){
            sendAPI(
                'get',
                `/mining/${type}/${id}/`,
                null,
                cb
            )
        },
        edit(id, obj){
            sendAPI(
                'patch',
                `/mining/${type}/${id}/`,
                obj
            )
        },
        delete(id, cb){
            sendAPI(
                'delete',
                `/mining/${type}/${id}/`,
                null,
                cb
            )
        },
        data: {
            get: {
                input(id, cb){
                    sendAPI(
                        'get',
                        `/mining/${type}/${id}/get_all_input_data/`,
                        null,
                        cb
                    )
                },
                output(
                    id, 
                    perc, //[[10,90], [...], ...]
                    cb,
                    cbErr 
                ){
                    sendAPI(
                        'get',
                        `/mining/${type}/${id}/get_output_data/`,
                        {percentiles: perc.map(e => `p${e[0]}p${e[1]}`).join('-')},
                        cb,
                        cbErr
                    )
                },
            },
            set(id, colname, mode, data, cb, cbErr){
                data = JSON.parse(JSON.stringify(data));
                
                Object.keys(data).forEach(key => {
                    if(data[key] == null)data[key] = data.p50 || data.p90 || data.p10 || 0;
                    if(typeof data[key] != 'object')data[key] = [data[key]];

                    data[key].forEach((e,k) => {if(!e)data[key][k] = 0;});
                });

                if(type == 'groups')data = {value: data.p50};
                
                sendAPI(
                    'post',
                    `/mining/${type}/${id}/set_${mode}_value/?colname=${colname}`,
                    data,
                    cb,
                    cbErr
                )
            },
            copy(id, from_id, to_p, from_p, cb, cbErr){
                sendAPI(
                    'post',
                    `/mining/${type}/${id}/copy_input_data/?from_id=${from_id}&from_p=${from_p}&to_p=${to_p}`,
                    null,
                    cb,
                    cbErr
                )
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
                    `/mining/${type}/${id}/download_excel/`, 
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
}

const group = ()=>Object.assign({}, default_actions('groups'),
    {
        calculate(id, cb, cbErr){
            sendAPI(
                'post',
                `/mining/groups/${id}/calculate/`,
                null,
                cb,
                cbErr
            ) 
        }
    }
)

const object = ()=>Object.assign({}, default_actions('objects'), 
    {
        syncFromLayers(id, cb, cbErr){
            sendAPI(
                'post',
                `/mining/objects/${id}/move_data_from_project/`,
                null,
                cb,
                cbErr
            ) 
        }
    }
)

export default {
    defaultValues,
    group,
    object,
}