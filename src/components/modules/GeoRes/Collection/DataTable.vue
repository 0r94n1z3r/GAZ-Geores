<template>
    <div class="data-table">
        <h1>Исходные данные</h1>

        <div class="table-wr" v-if="table.body.length">
            <table class="table-default">
                <thead>
                    <tr>
                        <th v-for="(i,k) in table.head" :key="k">
                            <div class="th-wr">
                                {{i.name}}
                                <div class="info-caller" v-if="i.name == 'Распределение'" @click="infoModal.call"><IInfo class="ico"/></div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(i,k) in table.body" :key="k" @click="()=>{if(info?.distribution_data?.columns?.[i?.type])info.distribution_data.columns[i.type].err = null}" :err="i.err || null">
                        <td class="name">
                            {{i.name}}, {{i.units}}
                            <div class="err">
                                {{i.err}}
                            </div>
                        </td>
                        <td class="param">{{i.param}}</td>
                        <td class="distr">
                            <span v-if="i.distr" :disabled="i.disabled || null" @click="i.ref.call(1)">{{i.distr}}</span>
                            <VButton hollow v-else :disabled="i.disabled || null" @click="i.ref.call(1)">Выбрать</VButton>
                        </td>
                        <td class="pick">
                            <VButton 
                                grey 
                                v-if="
                                    info.input_columns.includes(i.type) && 
                                    !info.distribution_data?.columns?.[i.type]?.data
                                " 
                                @click="i.ref.checkData()"
                            >   
                                Обновить
                            </VButton>
                            <DataInput v-else :type="i.type" @callModal="i.ref.call()" @setDistribution="setDistribution"/>
                        </td>
                        <DistrModal :ref="e => i.ref = e" :info="i" :type="i.type" @setDistribution="setDistribution"/>
                    </tr>
                </tbody>
            </table>
        </div>
        <InfoModal ref="infoModal" title="Ответственные за подготовку информации о распределениях ООО «Газпром ЦПС»."></InfoModal>
    </div>
</template>

<script setup>

    import { computed, ref } from "vue";

    import DistrModal from './DistrModal/DistrModal.vue';
    import DataInput from "@/components/modules/GeoRes/Collection/DataInput.vue";

    import { useDistributionStore } from "@/stores/distribution.js";
    
    import { Distribution } from "@/script/distribution.js"

    import { round } from '@/helpers/number.js';

    const Distr = useDistributionStore();
    
    const props = defineProps({
        info: Object
    });

    const table = computed(()=>{
        let head = [
            {name: "Параметр"},
            {name: "Параметры распределения"},
            {name: "Распределение"},
            {name: "Данные"},
        ]

        if(!Distr.columns.input_columns)return{head, body: []}

        let cols = Distr.columns.input_columns[props.info.fluid_type];
        let activeCols = props.info.distribution_data?.columns || {};

        let body = Object.keys(cols).map(e => {
            let col = cols[e];
            let aCol = activeCols[e];
            let aColDistr = aCol && Distr.distrs.find(k => k.name == aCol.distribution);

            let paramsNames = aCol?.params_input?.map(e => e.name) || [];

            if(aCol?.params_input){
                aCol.params = {}
                aCol.params_input.forEach(e => {
                    aCol.params[e.name] = e.value;
                })
            }

            return {
                symbol: col.symbol,
                units: col.units,
                name: col.verbose_name,
                param: 
                    aColDistr?.params && aCol?.params && 
                        aColDistr.params
                        .filter(e => e.symbol)
                        ?.map(e => `${e.symbol} = ${round(aCol.params[e.name], col.round_to, {splitThree: true})};`).join(' '),
                distr: aCol && (aColDistr?.locName || (aCol.distribution == 'constant' && 'Дискретное')),
                type: e,
                err: aCol?.err,
                disabled: aCol?.distribution == 'constant' || aCol?.data?.length == 1,
                roundTo: col.round_to
            }

            // param: 
                //     aColDistr?.params && aCol?.params_input && 
                //     [
                //         aColDistr.params
                //         .filter(e => e.symbol && paramsNames.includes(e.name))
                //         ?.map(e => `${e.symbol} = ${round(aCol.params_input.find(i => i.name == e.name)?.value, 3, {splitThree: true})};`)
                //         .join(' ') || '',
                //         aCol?.params_input
                //         .filter(e => e.name == 'p')
                //         ?.map(e => `P${e.percentile} = ${e.value}`) || ''
                //     ].join(' ')
                // ,
        })

        return {head, body};
    })

    const setDistribution = (id, type, distr, params_input=[])=>{
        props.info.up_to_date_simulation = false;

        let col = props.info.distribution_data.columns[type];
        let err = false;

        col.err = '';

        const errHandler = (error)=>{
            delete col.input_columns;
            delete col.distribution;
            col.err = '';
            setTimeout(()=>col.err = error);
        }

        params_input.forEach(e => {
            if(e.value === '')e.value = null;

            if(e.value == null && e.name != 'maxval' && e.name != 'minval'){
                e.value = null;
                if(!e.empty)err = true;
            }
        });

        if(err){
            errHandler('Заполните все значения');
            return;
        }
        
        Distribution.set(
            id,
            type,
            distr,
            params_input,
            ()=>{
            },
            (err)=>{
                errHandler(err);
            }
        )

        console.log(params_input);
        
        // Distribution.getTrueParams(
        //     id,
        //     distr,
        //     params_input,
        //     (res)=>{
        //         console.log(res, params_input);
        //         params_input.forEach(e => {
        //             e.value = res.params[e.name]
        //         });

        //         params_input = Object.entries(res.params).map(e => {return {name: e[0], value: e[1]}});

        //         Distribution.set(
        //             id,
        //             type,
        //             distr,
        //             params_input,
        //             ()=>{},
        //             (err)=>{
        //                 errHandler(err);
        //             }
        //         )
        //     },
        //     (err)=>{
        //         errHandler(err);
        //     }
        // )
    }

    const infoModal = ref(null);
    
</script>

<style lang="scss" scoped>
    h1{
        margin-bottom: 16px;
    }

    .table-wr{
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;

        table{
            width: 100%;
        }

        .th-wr{
            display: flex;
            gap: 5px;
            align-items: center;
        }

        tr{
            position: relative;

            .err{
                transition: .3s;
                position: absolute;
                top: 100%;
                left: 0;
                width: max-content;
                background: #fff;
                z-index: 5;
                color: var(--typo-alert);
                padding: 5px 10px;
                border-radius: 4px;
                box-shadow: 0px 4px 4px 0px rgb(0 32 51 / 4%);
                border: 1px solid var(--bg-border);
            }

            &:not([err]){
                .err{ 
                    @include hidden(-10px);
                }
            }
        }

        td{
            &.distr{
                span{
                    cursor: pointer;

                    &:hover{
                        color: var(--typo-brand);
                    }

                    &[disabled]{
                        pointer-events: none;
                    }
                }
            }

            &.param, &.distr{
                text-align: center;
            }

            .btn{
                white-space: nowrap;
                height: 32px;
                padding: 0 16px;
            }

        }
    }

    .info-caller{
        @include flex-c;
        cursor: pointer;
        height: 21px;
        width: 21px;
        flex-shrink: 0;
        margin-bottom: -3px;
    }
    
</style>