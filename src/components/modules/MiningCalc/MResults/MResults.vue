<template>
    <LayFooterPage reversed>
        <div class="loading-wr" v-if="!Mining.activeGroup.up_to_date_calculation || !Mining.resFilters"><VLoading/></div>
        
        <template v-else>
            <div class="page-wr">
                <div class="content">
                    <MRCharts class="content-block" :data="visibleData"/>
                </div>
                <MRFilters class="filters-wr content-block" :data="visibleData"/>
            </div>
            <div class="page-wr">
                <div class="content">
                    <MRTable class="content-block" :data="data" @updateScene="updateScene"/>
                </div>
            </div>
        </template>
        

        <template #footer>
            <div class="btns">
                <p err v-if="downloadError">{{downloadError}}</p>
                <MRScenes only bottom v-model="objToDownload"/>
                <VButton :loading="downloadLoading" @click="downloadReport" :disabled="!objToDownload?.[0] || null">Сформировать отчет</VButton>
            </div>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { computed, onMounted, reactive, ref, watch } from 'vue';
    import { useRouter, useRoute } from 'vue-router';

    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import MRCharts from '@/components/modules/MiningCalc/MResults/MRCharts.vue';
    import MRTable from '@/components/modules/MiningCalc/MResults/MRTable.vue';
    import MRFilters from '@/components/modules/MiningCalc/MResults/MRFilters.vue';

    import MRScenes from '@/components/modules/MiningCalc/MResults/ui/MRScenes.vue';

    import MiningStore from '@/stores/mining.js';
    import mAPI from "@/script/mining.js";

    const router = useRouter();
    const route = useRoute();
    const Mining = MiningStore(); 

//data
    const data = ref({});

    const visibleData = ref({});

    watch(()=>[...Mining.chartScenes], (n)=>{
        visibleData.value = {};

        n.forEach(e=>{
            let type = e.list?'Group':'Object';
            let obj = data.value[sceneKey(e)];

            if(!obj || obj.loading == true){
                updateScene(e);
            }else{
                visibleData.value[sceneKey(e)] = obj;
            }
        });
    });



    onMounted(()=>{
        if(!Mining.activeGroup.up_to_date_calculation){
            Mining.calculateResults(
                Mining.activeGroup,
                ()=>{
                    Mining.activeGroup.up_to_date_calculation = true;
                },
                ()=>Mining.setType(0)
            )
        }
    });

    watch(()=>route.params.groupId, (n)=>{
        if(!Mining.activeGroup.up_to_date_calculation){
            Mining.calculateResults(
                Mining.activeGroup,
                ()=>{
                    Mining.activeGroup.up_to_date_calculation = true;
                },
                ()=>Mining.setType(0)
            )
        }
    })

    const updateScene = (scene)=>{
        scene.loading = true;
        
        data.value[sceneKey(scene)] = {loading: true}

        mAPI[scene.list?'group':'object']().data.get.output(
            scene.id || Mining.activeGroup.id,
            scene.list?scene.list.map(e => e.p):[scene.p], //[[10,90], [...], ...],
            res=>{
                scene.loading = false;
                
                data.value[sceneKey(scene)] = res;
                visibleData.value[sceneKey(scene)] = res;
            },
            err=>{
                console.log(err);
            }
        );
    }

    const sceneKey = (scene)=>scene.list?scene.title:`${scene.title} [${scene.id}]`;

//download
    const objToDownload = ref([]);
    const downloadLoading = ref(false);
    const downloadError = ref('');

    const downloadReport = ()=>{
        let obj = objToDownload.value[0];

        console.log(obj);

        downloadLoading.value = true;
        downloadError.value = '';

        let type = obj.list?'group':'object';

        mAPI[type]().data.downloadReport(
            obj.id || Mining.activeGroup.id,
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

    .page-wr{
        display: flex;
        gap: 50px;
        
        .content{
            width: 100%;
            min-width: 0;
        } 

        .filters-wr{
            width: 332px;
            flex-shrink: 0;
        }

        .content-block{
            margin-bottom: 40px;

            :deep(.title){
                margin-bottom: 20px;
                @include flex-jtf;
                gap: 10px;
            }
        }
    }

    p[err]{
        color: var(--typo-alert);
    }
</style>