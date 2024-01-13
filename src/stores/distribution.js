import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted } from "vue";
import { getColumns } from "@/script/distribution.js";
import * as ss from 'simple-statistics';
import betaFunc from '@stdlib/math-base-special-beta';

import { create, all } from 'mathjs'

export const useDistributionStore = defineStore("distribution", ()=>{
    const math = create(all, {});

//cols
    const columns = ref({});

    const updateColumns = ()=>getColumns((res)=>columns.value = res);
    onMounted(updateColumns);

    const getRoundTo = (key)=>{
        if(!Object.entries.length)return 3;
        return Object.assign({}, ...Object.entries(columns.value).map(e => e[1]).map(e => Object.assign({}, ...Object.entries(e).map(j => j[1]))))[key].round_to
    }

//distrTypes
    const distrs = [
        {
            name: "normal",
            locName: "Нормальное",
            params: [
                {name: 'minval', title: "Минимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'maxval', title: "Максимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'mean', title: "Мат. ожидание", symbol: "µ", func: (arr)=>ss.mean(arr)},
                {name: 'std', title: "Стандартное отклонение", symbol: "σ", func: (arr)=>ss.standardDeviation(arr)},
            ],
            func: (x, params)=>{
                let mean = params.find(e => e.name == 'mean')?.value;
                let std = params.find(e => e.name == 'std')?.value;

                return (1/(std * Math.sqrt(2* Math.PI))) * 
                        Math.pow(
                            Math.E,
                            (-(Math.pow((x - mean),2)/(2*Math.pow(std,2))))
                        )
            },
            hasChart: true
        }, 
        {
            name: "lognormal",
            locName: "Логнормальное",
            params: [
                {name: 'minval', title: "Минимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'maxval', title: "Максимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'mean', title: "Мат. ожидание", symbol: "µ", func: (arr)=>ss.mean(arr)},
                {name: 'std', title: "Стандартное отклонение", symbol: "σ", func: (arr)=>ss.standardDeviation(arr)},
                // {name: 'pos', title: "Сдвиг", symbol: "→", func: ()=>0},
            ],
            func: (x, params)=>{
                let mean = params.find(e => e.name == 'mean')?.value;
                let std = params.find(e => e.name == 'std')?.value;
                // let pos = params.find(e => e.name == 'pos')?.value;

                return (
                    (1/(std * Math.sqrt(2* Math.PI))) * 
                    Math.pow(
                        Math.E,
                        (-(Math.pow((Math.log(x/* - pos*/) - mean),2)/(2*Math.pow(std,2))))
                    )
                )
                // const z = (Math.log(x) - pos - mean) / std;
                // const denom = x * std * Math.sqrt(2 * Math.PI);
                // return Math.exp(-z * z / 2) / denom;
            },
            hasChart: true
        }, 
        {
            name: "triangular",
            locName: "Треугольное",
            params: [
                {name: 'minval', title: "Минимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'maxval', title: "Максимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'low', title: "Минимум", symbol: "min", func: ()=>0},
                {name: 'high', title: "Максимум", symbol: "max", func: ()=>0},
                {name: 'peak', title: "Мода", symbol: "Мо", func: (arr)=>{ss.mode(arr)}},
            ],
            // func: (x, params)=>{
            //     let peak = params.find(e => e.name == 'peak').value;
            //     let minval = params.find(e => e.name == 'minval').value;
            //     let maxval = params.find(e => e.name == 'maxval').value;
            //
            //     if(x < minval){
            //         return 0
            //     }else if(x < peak){
            //         return Math.pow(x-minval, 2)/((maxval - minval)*(peak - minval))
            //     }else if(x < maxval){
            //         return 1 - (Math.pow(maxval-x, 2)/((maxval - minval)*(maxval - peak)))
            //     }else{
            //         return 1;
            //     }
            // },
            func: (x, params)=>{
                let peak = params.find(e => e.name == 'peak')?.value;
                let low = params.find(e => e.name == 'low')?.value;
                let high = params.find(e => e.name == 'high')?.value;

                if(x < low){
                    return 0
                }else if(x < peak){
                    return (2*(x-low))/((high - low)*(peak - low))
                }else if(x < high){
                    return (2*(high-x))/((high - low)*(high - peak))
                }else{
                    return 0;
                }
            },
            hasChart: true
        }, 
        {
            name: "uniform",
            locName: "Равномерное",
            params: [
                {name: 'minval', title: "Минимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'maxval', title: "Максимальное значение", symbol: "", func: ()=>null, empty: true},
            ],
            func: (x, params) => {
                let minval = params.find(e => e.name == 'minval')?.value;
                let maxval = params.find(e => e.name == 'maxval')?.value;

                if (x < minval || x > maxval || minval == maxval){
                    return 0;
                } else {
                    return 1 / (maxval - minval);
                }
            },
            hasChart: true
        }, 
        {
            name: "pert",
            locName: "PERT",
            params: [
                {name: 'minval', title: "Минимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'maxval', title: "Максимальное значение", symbol: "", func: ()=>null, empty: true},
                {name: 'low', title: "Минимум", symbol: "min", func: ()=>0},
                {name: 'high', title: "Максимум", symbol: "max", func: ()=>0},
                {name: 'peak', title: "Мода", symbol: "Мо", func: (arr)=>ss.mode(arr)},
            ],
            func: (x, params) => {
                let peak = params.find(e => e.name == 'peak')?.value || 0;
                let low = params.find(e => e.name == 'low')?.value || 0;
                let high = params.find(e => e.name == 'high')?.value || 0;

                if(high - low == 0)return 0;

                let A = math.evaluate(`1 + (4 * (${peak} - ${low})/(${high} - ${low}))`).toString();
                let B = math.evaluate(`1 + (4 * (${high} - ${peak})/(${high} - ${low}))`).toString();

                let betaF = betaFunc(parseFloat(A),parseFloat(B))

                if(!betaF)return 0;

                return parseFloat(math.evaluate(
                    `(
                        ((${x} - ${low}) ^ (${A} - 1)) * 
                        ((${high} - ${x}) ^ (${B} - 1))
                    ) / 
                    (
                        ${betaF} * 
                        ((${high} - ${low})^(${A} + ${B} - 1))
                    )`
                ).toString());
            },
            hasChart: true
        },
        {
            name: "sample",
            locName: "Дискретное",
            params: [],
            hasChart: true
        }
    ]

//
    const updateProps = (obj, colName, distrName, override)=>{
        const activeDistr = distrs.find(e => e.name == distrName);
        const colInfo = obj.distribution_data?.columns[colName];
        
        colInfo.distribution = activeDistr.name;

        if(
            !activeDistr?.params //|| 
            //(colInfo?.params?.minval != null && activeDistr.name == colInfo.distribution)
        )return;

        if(!colInfo.params_input)colInfo.params_input = [];
        let res = [];

        activeDistr.params.forEach(e => {
            let obj = colInfo.params_input?.find(i => e.name == i.name) || {name: e.name};

            obj.title = e.title;

            //console.log(colInfo?.fit?.[distrName]?.params?.[e.name]);

            if(colInfo.data && colInfo?.fit?.[distrName]?.params && override)obj.value = colInfo?.fit?.[distrName]?.params?.[e.name] //|| e.func(colInfo?.data || [])
            // console.log(colInfo?.fit?.[distrName]?.params);

            res.push(obj);
        });

        // console.log(res)
        
        colInfo.params_input = res;
    }

//----------------------------------------------------------------
    return {
        columns,
        getRoundTo,

        distrs,

        updateProps
    }
});