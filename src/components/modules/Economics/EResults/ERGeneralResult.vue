<template>
    <div>
        <VLoading v-if="loading"/>

        <template v-else-if="data">
            <div class="res-block">
                <h2>1. Чистый дисконтированный доход (до ГЭП), млн руб.</h2>

                <p class="err" v-if="err">{{err}}</p>
                <div v-else>
                    <ERChart :data="data?.npv_histogram" :percs="data?.npv"/>
                </div>
            </div>
            
            <div class="res-block">
                <h2>2. Ожидаемая денежная стоимость, млн руб.</h2>

                <p class="err" v-if="err">{{err}}</p>
                <div class="emv" v-else>
                    <div class="emv-container">
                        EMV = {{round(data?.emv, 0, {splitThree: true})}}
                    </div>
                    <ITick v-if="data.emv>0" class="ico" success/>
                    <ICross v-if="data.emv<0" class="ico" fail/>
                </div>
            </div>

            <div class="res-block">
                <h2>3. Технико-экономические показатели</h2>
                <p class="err" v-if="err">{{err}}</p>
                <div class="table-wr" v-else>
                    <!-- {{tbody}} -->
                    <table class="table-default scalars-table">
                        <thead>
                            <tr>
                                <th>ПАРАМЕТРЫ</th>
                                <th>P90</th>
                                <th>P50</th>
                                <th>P10</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Сценарии</td>
                                <td v-for="(i,k) in data?.scenarios" :key="k">    
                                    {{i}}
                                </td>
                            </tr>
                            <!--  eslint-disable-next-line -->
                            <template v-for="(i,k) in tbody" :key="k">
                                <tr v-if="i.type=='data'" :class="i.type">
                                    <td :style="{'padding-left': 12 + 24*i.offset+'px'}">
                                        {{i.verbose_name}}{{i.units?', ':''}}<span v-if="i.units">{{i.units}}</span>
                                    </td>
                                    <td v-for="(j,f) in i.value" :key="f">
                                        {{round(j, i.round_to, {splitThree: true})}}
                                    </td>
                                </tr>
                                <tr v-else :class="i.type">
                                    <td colspan="4">
                                        {{i.verbose_name}}
                                    </td>
                                </tr>
                            </template>
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </template>

        
    
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import { round } from "@/helpers/number.js";

    import ERChart from "@/components/modules/Economics/EResults/ERChart.vue";

    import ITick from "@/components/icons/ITick.vue";
    import ICross from "@/components/icons/ICross.vue";

    import Eco from "@/stores/economics.js";
    import eAPI from "@/script/economics.js";

    const model = computed(()=>Eco().activeModel); 

    const data = ref();
    const err = ref();
    const loading = ref(false);

    //update
        const update = ()=>{
            if(!model.value?.id)return;

            data.value = null;
            err.value = null;
            loading.value = true;
            
            eAPI.model.data.get.chart(
                model.value.id,
                (res)=>{
                    data.value = res;

                    data.value = Object.assign({}, res, {scalars: {}});

                    Object.keys(Eco().defaultValues.economic_output_scalars).map(k => 
                        data.value.scalars[k] = 
                            Object.assign(
                                {}, 
                                JSON.parse(JSON.stringify(Eco().defaultValues.economic_output_scalars[k])), 
                                {value: {p90: res.scalars.p90[k], p50: res.scalars.p50[k], p10: res.scalars.p10[k]}}
                            )
                    )

                    loading.value = false;
                },
                (error)=>{
                    err.value = error;
                    loading.value = false;
                }
            )
        }

        onMounted(update);
        watch(()=>model.value?.id, update);

//tbody
    const tbody = computed(()=>
        Eco().defaultValues.economic_total_table_rows.map(e => {
            return Object.assign(
                {},
                JSON.parse(JSON.stringify(e)),
                e.type == 'data'?
                    data.value.scalars[e.name]
                :{}
            )
        })
    )
</script>

<style lang="scss" scoped>
    p{
        color: var(--typo-control-ghost);
    }

    .scalars-table{
        border: 1px solid var(--bg-border);

        span{
            white-space: nowrap;
        }

        td:first-child{
            text-align: left;
        }

        tr.data{
            td:not(:first-child){
                text-align: right;
            }
        }

        tr:is(.header, .text){
            border: 1px solid var(--bg-border);
        }

        tr.header{
            background: var(--bg-ghost);
            td{
                font-weight: 600;
            }
        }

        tr.text{
            background: var(--bg-default);
        }
    }

    .table-wr{
        width: 100%;
        overflow-x: auto;
    }

    .emv{
        display: flex;
        gap: 20px;
        align-items: center;

        .emv-container{
            padding: 8px 16px;
            border: 1px solid var(--bg-border);
            border-radius: 4px;
        }

        .ico{
            height: 16px;
            width: 16px;

            &[success]{
                color: var(--bg-success);
            }

            &[fail]{
                color: var(--typo-alert);
            }
        }
    }
</style>