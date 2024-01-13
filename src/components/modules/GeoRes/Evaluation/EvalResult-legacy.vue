<template>
    <div>
        <h3>Результаты расчетов</h3>

        <div class="table-wr">
            <table class="table-default">
                <thead>
                    <tr>
                        <th v-for="(i,k) in resultData.head" :key="k">{{i?.name}} <span>{{i?.units}}</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(i,k) in resultData.body" :key="k">
                        <td v-for="(j,f) in i" :key="f" v-html="j"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";

    import { round } from '@/helpers/number.js';

    import { useProjectStore } from "@/stores/project.js";

    import { useDistributionStore } from "@/stores/distribution.js";
    
    const proj = useProjectStore();
    
    const props = defineProps({
        report: Object,
        columns: Array,
        fluidType: String,
    });

    const resultData = computed(()=>{
        if(!props.report?.percentiles) return;

        let res = {
            head: [],
            body: [[],[],[]]
        }

        const add = (arrId, tile, ...items)=>{
            res.head[arrId] = tile;
            items.forEach((e,k) => res.body[k][arrId] = e);
        }
        
        // const add = (tile, ...items)=>{
        //     res.head.push(tile);
        //     items.forEach((e,k) => res.body[k].push(e));
        // }

        add(
            0,
            {name: 'Перцентиль', key: 'perc'},
            'P<span class="sub">90</span>',
            'P<span class="sub">50</span>',
            'P<span class="sub">10</span>'
        )

        //console.log(props.columns, props.report);

        const cols = {
            gas: [
                'perc',
                'area',
                'thickness',
                'porosity_coef',
                'saturation_coef',
                'initial_pressure',
                'initial_correction',
                'temperature',
                'condensate_amount',
                'q',
                'q_condensate',
                'gas_extraction_coef',
                'condensate_extraction_coef',
                'q_extraction',
                'q_condensate_extraction',
                'success',
                'q_gcos',
                'q_condensate_gcos',
                'q_extraction_gcos',
                'q_condensate_extraction_gcos'
            ],
            oil: [
                'perc',
                'area',
                'thickness',
                'porosity_coef',
                'saturation_coef',
                'density',
                'conversion_coef',
                'gas_amount',
                'q',
                'q_gas',
                'success',
                'q_gcos',
                'q_gas_gcos'
            ]
        }

        props.columns.forEach(e => {
            add(
                cols[props.fluidType].indexOf(e.title),
                {name: e.verbose_name+',', units: e.units, key: e.title},
                round(props.report.percentiles[e.title]?.p90, 3, {splitThree: true}),
                round(props.report.percentiles[e.title]?.p50, 3, {splitThree: true}),
                round(props.report.percentiles[e.title]?.p10, 3, {splitThree: true})
            )
        })

        add(
            cols[props.fluidType].indexOf('success'),
            {name: `Вероятность геологического успеха, д. ед`, key: 'success'},
            round(props.report.gcos, 3, {splitThree: true}),
            round(props.report.gcos, 3, {splitThree: true}),
            round(props.report.gcos, 3, {splitThree: true})
        )

        console.log(res);

        return res;
    })
</script>

<style lang="scss" scoped>
    .table-wr{
        overflow-y: auto;
        position: relative;

        th{
            min-width: 100px;
            height: 57px;
            white-space: normal;
            font-size: 14px;
            padding: 12px;

            span{
                white-space: nowrap;
            }
        }

        td{
            white-space: nowrap;
            &:not(:first-child){
                text-align: center;
            }
            padding: 12px 24px;
        }
    }
</style>