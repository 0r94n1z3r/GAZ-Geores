<template>
    <LayFooterPage reversed :hideFooter="model?.loading">
        <VLoading v-if="model?.loading"/>
        
        <template v-else>
            <h1>Результаты расчетов</h1>
        
            <ERGeneralResult/>

            <!-- <hr> -->

            <div class="report-wr" v-if="false">
                <div class="scene-picker">
                    <MRScenes only v-model="sceneWr"/>

                    <VButton fit grey @click="getData" v-if="scene && selectedScene?.title != scene?.title" :loading="loading || null">Выбрать</VButton>
                </div>

                <p v-if="err" err>{{err}}</p>

                <!-- {{data}} -->

                <div class="res-block" v-if="data && scene && selectedScene?.title == scene?.title">
                    <h2>4. Отчет</h2>
                    <div class="table-wr">
                        <table class="table-default scalars-table">
                            <thead>
                                <tr>
                                    <th>Параметры</th>
                                    <th>Сумма</th>
                                    <th v-for="(i,k) in Object.values(data.columns)[0].value.length" :key="k">
                                        {{Proj.activeProject.mining_start_year + k}}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(i,k) in data.columns" :key="k">
                                    <td>{{i.verbose_name}}{{i.units?', ':''}}<span v-if="i.units">{{i.units}}</span></td>
                                    <td>{{i.value.reduce((acc, e)=>acc+e,0)}}</td>
                                    <td v-for="(j,f) in i.value" :key="f">
                                        {{j}}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="btns">
                <p err v-if="downloadError">{{downloadError}}</p>
                <MRScenes only group-only bottom v-model="objToDownload" :selectedPercs="model?.calculated_percentiles" selectedOnly/>
                <VButton :loading="downloadLoading" @click="downloadReport" :disabled="!objToDownload?.[0] || null">Сформировать отчет</VButton>
            </div>
        </template>
        
    </LayFooterPage>
</template>

<script setup>
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";
    import ERGeneralResult from "@/components/modules/Economics/EResults/ERGeneralResult.vue";
    
    import MRScenes from "@/components/modules/MiningCalc/MResults/ui/MRScenes.vue";
    
    import Eco from "@/stores/economics.js";
    import { useProjectStore } from "@/stores/project.js";

    import eAPI from "@/script/economics.js";

    import { computed, onMounted, ref, watch } from "vue";

    const model = computed(()=>Eco().activeModel); 

    const Proj = useProjectStore();

    onMounted(()=>Eco().updateModelByGroup(
        Eco().activeGroup?.id, 
        (error)=>err.value=error
    ));

    //scene
        const sceneWr = ref([]);
        const scene = computed(()=>sceneWr.value[0]);
        const selectedScene = ref(null); 

    //update
        const update = ()=>{
            if(!model.value?.id)return;

            if(!model.value.has_all_data){
                Eco().setType(0);
            }

            if(!model.value.up_to_date_calculation){
                model.value.loading = true;

                eAPI.model.calculate(
                    model.value?.id,
                    res => {
                        model.value.up_to_date_calculation = true;
                        model.value.loading = false;
                    }, 
                    error => {
                        Eco().setType(0);
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
            
            eAPI.model.data.get.output(
                model.value.id,
                scene.value.list?scene.value.list.map(e => e.p):[scene.value.p],
                (res)=>{
                    selectedScene.value = scene.value;

                    data.value = {
                        scalars: {},
                        columns: {},
                    };

                    Object.keys(Eco().defaultValues.economic_output_scalars).map(k => 
                        data.value.scalars[k] = 
                            Object.assign(
                                {}, 
                                JSON.parse(JSON.stringify(Eco().defaultValues.economic_output_scalars[k])), 
                                {value: res.scalars[k]}
                            )
                    )

                    Object.keys(Eco().defaultValues.economic_output_columns).map(k => 
                        data.value.columns[k] = 
                            Object.assign(
                                {}, 
                                JSON.parse(JSON.stringify(Eco().defaultValues.economic_output_columns[k])), 
                                {value: res.columns[k]}
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

    //download
        const objToDownload = ref([]);
        const downloadLoading = ref(false);
        const downloadError = ref('');

        const downloadReport = ()=>{
            let obj = objToDownload.value[0];

            downloadLoading.value = true;
            downloadError.value = '';

            eAPI.model.data.downloadReport(
                model.value.id,
                obj.title,
                obj.list?obj.list.map(e => e.p):[obj.p],
                res => {
                    downloadLoading.value = false;
                },
                err => {
                    downloadLoading.value = false;
                    downloadError.value = err;
                }
            )
        }
</script>

<style lang="scss" scoped>
    :deep(.res-block){
        padding-top: 20px;
        @include flex-col;
        gap: 10px;


        h2{
            font-size: 18px;
            color: var(--bg-shadow);
        }
    }

    hr{
        border-top: 1px solid var(--bg-border);
        margin: 20px 0;
    }

    .scene-picker{
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        
        .btn{
            height: 32px!important;   
            padding: 0 20px!important;
            font-size: 14px;
        }

        p{
            color: var(--typo-control-ghost);
            font-size: 14px;
            align-self: center;
        }
    }

    p[err]{
        font-size: 14px;
        color: var(--typo-alert);
        margin-top: 5px;
    }

    .table-wr{
        width: 100%;
        overflow-x: auto;
    }

    .scenes{
        margin-bottom: 24px;
    }

    table.table-default thead tr th{
        white-space: wrap;
    }

    td{
        text-align: right;

        span{
            white-space: nowrap;
        }
    }

    .footer{
        .btns{
            display: flex;
            gap: 10px;

            .btn{
                width: max-content;
                height: 32px;
                padding: 0 16px;
                font-size: 14px;
            }
        }
    }

    .report-wr{
        min-height: calc(40vh + 16px);
    }



</style>