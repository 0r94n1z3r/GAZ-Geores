import {sendAPI} from './api.js';
import { useProjectStore } from "@/stores/project.js";
import { beautifyDate } from '@/helpers/date.js';

import {downloadFile} from "@/helpers/downloadFile.js";

export const parseExcel = (file, cb, cbErr)=>{
    sendAPI(
        'post',
        `/projects/parse_excel/`,
        {file},
        (res)=>{
            cb(res.map(sh => {
                let resSh = sh;
                let dt = resSh.data;
                resSh.data = {};
                dt.forEach(val => 
                    sh.data[val[0]] = val.slice(1)
                );

                return resSh;
            }))
        },
        cbErr,
        'multipart/form-data'
    )
} 

export const getColumns = (cb)=>{
    sendAPI(
        'get',
        `/projects/default_columns/`,
        {},
        cb
    );
}

export const Distribution = {
    data: {
        set(id, colname, data, cb=()=>{}, cbErr=()=>{}){
            sendAPI(
                'post',
                `/projects/layers/${id}/write_data/?colname=${colname}`,
                {data} ,
                cb,
                cbErr
            )
        },
        get(id, colname, cb, cbErr){
            sendAPI(
                'get',
                `/projects/layers/${id}/read_data/?colname=${colname}`,
                {},
                cb,
                cbErr
            )
        },
        delete(id, colname, cb, cbErr){
            sendAPI(
                'delete',
                `/projects/layers/${id}/delete_data/?colname=${colname}`,
                null,
                cb,
                cbErr
            )
        }
    },
    
    constant: {
        set(id, colname, value){
            sendAPI(
                'post',
                `/projects/layers/${id}/set_constant/?colname=${colname}`,
                {value}
            )
        },

        set_with_components(id, colname, components, cb){
            sendAPI(
                'post',
                `/projects/layers/${id}/set_constant_with_components/?colname=${colname}`,
                {components},
                cb
            )
        },    
    },

    fit(colname, id, cb){
        sendAPI(
            'get',
            `/projects/layers/${id}/fit_distribution/`,
            {colname},
            cb
        )
    },

    set(id, colname, distribution, params_input, cb=()=>{}, cbErr=()=>{}){
        // let params_input = Object.keys(params).map(k => {
        //     return{
        //         name: k,
        //         value: params[k]
        //     }
        // })

        params_input = params_input.map(e => {
            return {
                name: e.name,
                value: e.value || 0
            }
        });

        console.log(params_input);

        sendAPI(
            'post',
            `/projects/layers/${id}/set_distribution/?colname=${colname}`,
            {distribution, params_input},
            cb,
            cbErr
        )
    },

    getTrueParams(id, distribution, params_input, cb, cbErr){
        params_input = prepareParams(params_input);

        sendAPI(
            'post',
            `/projects/layers/${id}/convert_distribution_params/`,
            {distribution, params_input},
            cb,
            cbErr
        )
    },
    
    runSimulation(id, n, cb, cbErr){
        sendAPI(
            'post',
            `/projects/layers/${id}/run_simulation/?n=${n!=null?n:1000}`,
            null,
            cb,
            cbErr
        )
    },

    getReportData(id, type, cb, cbErr, fluid_type){
        sendAPI(
            'get',
            `/projects/${type.toLocaleLowerCase()}s/${id}/get_output_data/`,
            {bins: 32, fluid_type},
            cb, 
            cbErr
        )
    },

    getExtraPerc(colname, percentile, id, type, fluid_type, cb){
        sendAPI(
            'get',
            `/projects/${type.toLocaleLowerCase()}s/${id}/get_extra_percentile/`,
            {colname, percentile, fluid_type},
            cb,
        )
    },

    download: {
        report(id, type, cb, cbErr){
            sendAPI(
                'get', 
                `/projects/${type.toLocaleLowerCase()}s/${id}/download_excel/`, 
                {format: 'json'},
                response => downloadFile(response, `Отчет, ${useProjectStore().activeProject.name}, ${beautifyDate(new Date(),true)}.xlsx`, cb),
                cbErr,
                null,
                'blob'
            )
        },
        simulated(id, type, cb, cbErr){
            sendAPI(
                'get', 
                `/projects/${type.toLocaleLowerCase()}s/${id}/download_simulated_data/`, 
                {format: 'json'},
                response => downloadFile(response, `Промежуточные данные, ${useProjectStore().activeProject.name}, ${beautifyDate(new Date(),true)}.xlsx`, cb),
                cbErr,
                null,
                'blob'
            )
        },
        project(id, cb){
            sendAPI(
                'get', 
                `/projects/projects/${id}/export/`,
                {format: 'json'},
                response => downloadFile(response, `Проект, ${useProjectStore().activeProject.name}, ${beautifyDate(new Date(),true)}.json`, cb),
                ()=>{},
                null,
                'blob'
            )
        }
    }
}

const prepareParams = (params)=>params.map(e => {
    let obj = {
        name: e.perc?'p':e.name,
        value: e.perc?e.pvalue:e.value
    }

    if(e.perc)obj.percentile = e.percentile

    return obj;
});