<template>
    <LayFooterPage reversed :hide-footer="true">

        <VLoading v-if="model?.loading"/>

        <template v-else>
            <h1>Результаты расчетов</h1>

            <div class="content-block">
                <!-- <div class="blocks">
                    <div class="block">Сдача газа - 100</div>
                    <div class="block">Сдача газа - 100</div>
                    <div class="block">Сдача газа - 100</div>
                </div> -->

                <div class="scene-wr">
                    <MRScenes only v-model="sceneWr"/>

                    <div class="btn-wr" v-if="scene && selectedScene?.title != scene?.title">
                        <VButton @click="getData" fit grey :loading="loading || null">Выбрать</VButton>
                    </div>
                </div>
            </div>

            <p v-if="err" err>{{err}}</p>

            <template v-if="data && scene && selectedScene?.title == scene?.title">
                <div class="content-block">
                    <FdCharts v-if="data.chart" :info="data.chart" :year="model.cost_start_year" :year-n="model.cost_n_years"/>
                </div>

                <div class="content-block">
                    <h3>Затраты по объектам</h3>
                    <div class="card-group" v-for="(g,gk) in data.blocks" :key="gk">
                        <h4>{{g.verbose_name}}</h4>

                        <div class="cards-container">
                            <div class="card" v-for="(c,ck) in g.columns" :key="ck">
                                <div class="title">
                                    <!-- <IFilter class="ico"/> -->
                                    {{c.verbose_name}}
                                </div>
                                <div class="card-content">
                                    {{round(c.values?.reduce((acc, e)=>acc + e, 0), 0, {splitThree: true})}}
                                    {{c.units}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import MRScenes from "@/components/modules/MiningCalc/MResults/ui/MRScenes.vue";

    import IFilter from "@/components/icons/IFilter.vue";
    
    import { round } from "@/helpers/number.js";

    import FdCharts from "./FdCharts.vue";

    import FD from "@/stores/fieldDev.js";
    import fdAPI from "@/script/fieldDev.js";

    import { computed, onMounted, ref, watch } from "vue";

    const model = computed(()=>FD().activeModel); 

//scenes
    const sceneWr = ref([]);
    const scene = computed(()=>sceneWr.value[0]);
    const selectedScene = ref(null); 

//update
    onMounted(()=>FD().updateModelByGroup(FD().activeGroup?.id));

    const update = ()=>{
        if(!model.value?.id)return;

        if(!model.value.has_all_data){
            FD().setType(0);
        }

        if(!model.value.up_to_date_calculation){
            model.value.loading = true;

            fdAPI.model.calculate(
                model.value?.id,
                res => {
                    model.value.up_to_date_calculation = true;
                    model.value.loading = false;
                }, 
                error => {
                    FD().setType(0);
                }
            );
        }
    }

    onMounted(update);
    watch(()=>model.value?.id, update);

//data
    const data = ref(null);

    const loading = ref(false); 
    const err = ref();

    const getData = ()=>{
        data.value = null;
        err.value = null;
        loading.value = true;
        
        fdAPI.model.data.get.output(
            model.value.id,
            scene.value.list?scene.value.list.map(e => e.p):[scene.value.p],
            (res)=>{
                console.log(FD().defaultValues);
                console.log(res);

                selectedScene.value = scene.value;

                data.value = {
                    chart: null,
                    blocks: null,
                }

                data.value.chart = 
                    Object.fromEntries(
                        FD().defaultValues.cost_output_chart.map(k => 
                            [
                                k, 
                                Object.assign(
                                    JSON.parse(JSON.stringify(FD().defaultValues.cost_output[k])),
                                    {values: res.columns[k]}
                                )
                            ]
                        )
                    )

                data.value.blocks = 
                    JSON.parse(JSON.stringify(FD().defaultValues.cost_output_fieldsets))
                    .map(
                        e => Object.assign(
                            e,
                            {
                                columns:  Object.fromEntries(e.columns.map(k => 
                                    [
                                        k, 
                                        Object.assign(
                                            JSON.parse(JSON.stringify(FD().defaultValues.cost_output[k])),
                                            {values: res.columns[k]}
                                        )
                                    ]
                                ))
                            }
                        )
                    )

                console.log(data.value);

                loading.value = false;
            },
            (error)=>{
                err.value = error;
                loading.value = false;
            }
        )
    }

    
</script>

<style lang="scss" scoped>
    .content-block{
        padding: 16px 0;

        &:not(:last-child){
            border-bottom: 1px solid var(--bg-border);
        }
    }

    .scene-wr{
        display: flex;
        gap: 8px;

        .btn-wr{
            .btn[fit]{
                font-size: 14px;
                height: 32px;
                padding: 0 16px;
            }
        }
    }

    .blocks{
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 36px;

        .block{
            border: 1px solid var(--bg-border);
            border-radius: 4px;
            padding: 4px 8px;
        }
    }

    

    .card-group{
        margin-top: 24px;

        h4{
            margin-bottom: 6px;
        }

        .cards-container{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .card{
            border: 1px solid var(--bg-border);
            border-radius: 4px;
            padding: 4px 8px;
            min-width: 200px;

            .title{
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 8px;

                .ico{
                    color: var(--typo-control-secondary);
                }
            }

            .card-content{
                font-weight: 500;
                font-size: 18px;
            }
        }
    }
</style>