<template>
    <div>
        <h3>Результаты расчетов</h3>

        <div class="table-wr">
            <div class="table"
                :style="{'grid-template-columns': `repeat(${head.length}, 1fr)`}"
            >
                <!-- header -->
                    <div class="cell cell-head" v-for="(i,k) in head" :key="k">
                        <p>{{i.name}} <span>{{i.units}}</span></p>
                    </div>

                <!-- proj -->
                    <div class="cell"
                        v-if="level == 'Project'"
                        :style="{'grid-row': `2 / ${resultLayers.length + 2}`}"
                    >
                        <p>{{proj.currentLevel.content.name}}</p>
                    </div>

                <!-- sensors -->
                    <div class="cell"
                        v-for="(i,k) in sensors"
                        :key="k"
                        :style="{
                            'grid-column': level == 'Project'?2:1,
                            'grid-row': `span ${i.layers.length + 1}`
                        }"
                    >
                        <p>{{i.name}}</p>
                    </div>

                <!-- rows -->
                    <div class="info-row"
                        v-for="(i,k) in resultLayers"
                        :key="k"

                        :style="{
                            'grid-row': 2+k,
                            'grid-column': (level == 'Project'?3:level == 'Sensor'?2:1) + '/ -1',
                            'grid-template-columns': `repeat(${cols[fluidType].length + 2}, 1fr)`
                        }"

                        :sum="i.type == 'sum' || null"
                    >
                        <template v-if="i.type == 'layer'">
                            <div class="cell" :style="{'grid-row': 'span 3'}"><p>{{i.name}}</p></div>
                            <div class="cell" :style="{'grid-row': 'span 3'}"><p>{{fluidType == 'oil'?'Нефть':'Газ'}}</p></div>
                        </template>
                        <div class="cell" v-else-if="i.type == 'sum'" :style="{'grid-row': 'span 3', 'grid-column': 'span 2'}"><p>Всего ресурсов</p></div>
                        
                        <div class="cell" v-for="(j, f) in i.data.flat()" :key="f">
                            <p v-html="j"></p>
                        </div>
                        <!-- {{i.type}} | {{i.name}} -->
                    </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";

    import { round } from '@/helpers/number.js';

    import { useProjectStore } from "@/stores/project.js";

    import { useDistributionStore } from "@/stores/distribution.js";
    
    const proj = useProjectStore();
    const level = computed(()=>proj.currentLevel.level);
    
    const props = defineProps({
        report: Object,
        columns: Array,
        fluidType: String,
    });

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
    };

    const restrictedSumCols = [
        'perc',
        'area',
        'thickness',
        'porosity_coef',
        'saturation_coef',
        'initial_pressure',
        'initial_correction',
        'temperature',
        'condensate_amount',
        'density',
        'conversion_coef',
        'gas_amount',
        'gas_extraction_coef',
        'condensate_extraction_coef',
    ]

    const head = computed(()=>{
        let res = [];

        if(props.report.sensors){
            res.push({name: 'Лиц. участок'})
        }

        if(props.report.layers || props.report.sensors){
            res.push({name: 'Пласт'})
        }

        res.push({name: 'Залежь'})
        res.push({name: 'Флюид'})

        return [
            ...res, 
            ...cols[props.fluidType].map(e => {
                let col = props.columns.find(c => c.title == e);

                if(!col){
                    switch(e){
                        case 'perc': return {name: 'Перцентиль', key: 'perc'};
                        case 'success': return {name: `Вероятность геологического успеха,`, units: 'д. ед', key: 'success'}
                    }
                }

                return {
                    name: col?.verbose_name+',', 
                    units: col?.units, 
                    key: e
                }
            })
        ]
    })

    const sensors = computed(()=>{
        if(props.report.sensors)return props.report?.sensors || [];
        if(props.report.layers)return [props.report];
        return [];
    })

    const resultLayers = computed(()=>{        
        if(sensors.value.length <= 1 && !(sensors.value?.[0]?.layers?.length > 1)){
            return [{
                type: 'layer',
                name: level.value == 'Layer'?props.report.name:sensors.value[0].layers[0].name,
                data: getRow(props.report)
            }];
        }

        let res = [];

        sensors.value.forEach(e => {
            e.layers.forEach(l => {
                res.push({
                    type: 'layer',
                    name: l.name,
                    data: getRow(l)
                })
            })

            res.push({
                type: 'sum',
                data: getRow(e, true)
            })
        })

        return res;
    })

    const getRow = (reportPiece, isSum)=>{
        if(!reportPiece?.percentiles) return;

        let res = [[],[],[]];

        const add = (arrId, ...items)=>{
            items.forEach((e,k) => res[k][arrId] = e);
        }

        add(
            0,
            'P<span class="sub">90</span>',
            'P<span class="sub">50</span>',
            'P<span class="sub">10</span>'
        )

        props.columns.forEach(e => {
            if(isSum && restrictedSumCols.includes(e.title)){
                add(cols[props.fluidType].indexOf(e.title), null, null, null)
                return;
            }

            add(
                cols[props.fluidType].indexOf(e.title),
                round(reportPiece.percentiles[e.title]?.p90, e.round_to, {splitThree: true}),
                round(reportPiece.percentiles[e.title]?.p50, e.round_to, {splitThree: true}),
                round(reportPiece.percentiles[e.title]?.p10, e.round_to, {splitThree: true})
            )
        })

        add(
            cols[props.fluidType].indexOf('success'),
            round(reportPiece.gcos, 2, {splitThree: true}),
            round(reportPiece.gcos, 2, {splitThree: true}),
            round(reportPiece.gcos, 2, {splitThree: true})
        )

        return res;
    }
</script>

<style lang="scss" scoped>
    h3{
        margin-bottom: 16px;
    }

    .table-wr{
        overflow-y: auto;
        position: relative;
    }

    .table{
        min-width: 100%;
        display: grid;
        border-left: 1px solid var(--bg-border);

        .cell{
            white-space: normal;
            font-size: 14px;
            padding: 12px;
            @include flex-c;
            border: solid var(--bg-border);
            border-width: 0px 1px 1px 0;
            min-width: 158px;

            p{
                text-align: center;
                word-break: break-word;
            }

            &-head{
                grid-row: 1;
                border-top-width: 1px;
                border-bottom-color: var(--bg-border-focus);
            }
        }

        .info-row{
            display: grid;
            
            border-bottom: 1px solid var(--bg-border);

            &[sum] p{
                font-weight: bold;
            }
        }
    }
</style>