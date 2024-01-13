<template>
    <LayFooterPage :hideFooter="loading">

        <div class="fluid" v-if="level != 'Layer'">
            <FluidType :info="fluid" @update="checkEvalReady"/>
        </div>

        <div class="loading-wr" v-if="loading">
            <VLoading/>
        </div>

        <template v-else>
            <div class="error" v-if="error"><h1>{{error}}</h1></div>

            <EvalData 
                :report="report"
                :fluidType="fluidType"
            />

            <EvalReserves 
                class="ev-block"
                v-if="report.histograms"
                :report="report"
                :fluidType="fluidType"
            /> 

            <EvalTornado
                class="ev-block" 
                v-if="report.percentiles && level == 'Layer'"
                :report="report"
                :columns="columns"
                :fluidType="fluidType"
            />

            <EvalResult
                class="ev-block no-bounds" 
                v-if="report.percentiles"
                :report="report"
                :columns="columns"
                :fluidType="fluidType"
            />     
        </template>

        <template #footer>
            <div class="type">
                <div>Сформировать отчет в формате .xlsx</div>
                <!-- <label class="radio">
                    <input :value="0" v-model="format" type="radio">
                    <span>.pdf</span>
                </label>
                <label class="radio">s
                    <input :value="1" v-model="format" type="radio">
                    <span>.xlsx</span>
                </label> -->
            </div>

            <div class="btns">
                <VButton :loading="reportDownloadLoading || null" v-if="level == 'Layer'" hollow @click="downloadSimulated()">Промежуточные данные</VButton>
                <VButton :loading="reportDownloadLoading || null" @click="downloadReport()">Сформировать отчет</VButton>
            </div>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
    
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";
    import FluidType from "@/components/modules/GeoRes/Collection/FluidType.vue";

    import EvalData from "@/components/modules/GeoRes/Evaluation/EvalData.vue";
    import EvalReserves from "@/components/modules/GeoRes/Evaluation/EvalReserves.vue";
    import EvalTornado from "@/components/modules/GeoRes/Evaluation/EvalTornado.vue";
    import EvalResult from "@/components/modules/GeoRes/Evaluation/EvalResult.vue";

    import { Distribution } from "@/script/distribution.js";

    import { useProjectStore } from "@/stores/project.js";
    import { useDistributionStore } from "@/stores/distribution.js";
    import { useRoute } from "vue-router";

    import { round } from '@/helpers/number.js';

    const route = useRoute();

    const proj = useProjectStore();
    const distr = useDistributionStore();

    const info = computed(()=>proj.currentLevel.content);

    const level = computed(()=>proj.currentLevel.level);

    const report = ref({})

//check
    const loading = ref(true);
    const error = ref('');

    const errorHandler = (err)=>{
        if(route.name == "New")return;
        loading.value = false;
        proj.setType(0);
        error.value = err;
    }

    const checkEvalReady = ()=>{
        loading.value = true;
        error.value = '';
        report.value = {};

        updateAll(
            ()=> Distribution.getReportData(
                info.value.id,
                proj.currentLevel.level,
                res => {
                    report.value = res;
                    loading.value = false;
                },
                errorHandler,
                fluidType.value
            )
        )
    }

    const updateAll = (cb)=>{
        let list = 
            level.value == "Layer"?
                (proj.currentLevel.content.has_all_data && !proj.currentLevel.content.up_to_date_simulation)?[proj.currentLevel.content]:[]
            :level.value == "Sensor"?
                proj.currentLevel.content.layers.filter(e => e.has_all_data && !e.up_to_date_simulation)
            :
                proj.currentLevel.content.sensors.map(e => e.layers).flat().filter(e => e.has_all_data && !e.up_to_date_simulation)

        let left = list.length;

        if(!left){cb();return;}

        let fin = (k)=>{
            left--;
            if(!left){
                cb();
            }else{
                run(list[k]);
            }
        } 

        let run = (item, k)=>{
            Distribution.runSimulation(
                item.id,
                item.n>0?item.n:null,
                ()=>{
                    fin(k++);
                    item.up_to_date_simulation = true;
                },
                ()=>fin(k++)
            )
        }

        run(list[0], 0);
    }

    watch(()=>info.value.id, checkEvalReady);
    watch(()=>info.value.has_all_data, (n)=>{if(n != null)checkEvalReady()});
    onMounted(checkEvalReady);

    const columns = computed(()=>{
        const parse = (key)=>Object.keys(distr.columns?.[key]?.[fluidType.value] || {}).map(e => {
                let res = distr.columns[key][fluidType.value][e];
                res.title = e;
                return res;
            })
            
        return [
            ...parse('input_columns'),
            ...parse('output_columns')
        ]
    });

//fluid
    const fluid = ref({fluid_type: (info.value.fluid_type || 'gas')});
    const fluidType = computed(()=>fluid.value.fluid_type);

    watch(()=>info.value.fluid_type, n=>{
        fluid.value = {fluid_type: (info.value.fluid_type || 'gas')}; 
    })

//download
    const reportDownloadLoading = ref(false);

    const downloadReport = ()=>{
        reportDownloadLoading.value = true;

        Distribution.download.report(
            info.value.id,
            proj.currentLevel.level,
            ()=>{reportDownloadLoading.value = false},
            ()=>{reportDownloadLoading.value = false}
        )
    }

    const downloadSimulated = ()=>{
        reportDownloadLoading.value = true;

        Distribution.download.simulated(
            info.value.id,
            proj.currentLevel.level,
            ()=>{reportDownloadLoading.value = false},
            ()=>{reportDownloadLoading.value = false}
        )
    }
    
</script>

<style lang="scss" scoped>
    

    .loading-wr{
        @include flex-c;
        height: 100%;
    }

    .fluid{
        margin-bottom: 24px;
    }

    .ev-block{
        padding: 40px 0;
        border-top: 1px solid var(--bg-border);
        width: 100%;
        max-width: 970px;
        
        h3{
            margin-bottom: 16px;
        }

        &.no-bounds{
            max-width: unset;
        }
    }

    .footer{
        .type{
            display: flex;
            gap: 24px;
            align-items: baseline;

            span{
                font-size: inherit;

                &::before, &::after{
                    transform: translateY(4px);
                }
            }
        }

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
</style>