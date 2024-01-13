<template>
    <LayContentPage>
        <PageNavigation :list="typesListDisplay" class="types-nav" v-if="route.meta.mining"/>
        <Component 
            class="page-content-wr" 
            
            :is="typePage" 
            :data="miningData" 
            :id="objectModeList.activeItem.id"

            @backToBasic="objectModeList.activeItem = objectModeList.list[0]" 
        />
    </LayContentPage>
</template>

<script setup>
    import { computed, onMounted, reactive, ref, watch } from "vue"

    import PageNavigation from "@/components/page/PageNavigation.vue";
    
    import VCollection from "@/components/modules/GeoRes/Collection/VCollection.vue";
    import LayContentPage from "@/components/layouts/LayContentPage.vue";
    import PCProj from "@/components/modules/MiningCalc/PCProj/PCProj.vue";
    import MObjectBasicData from "@/components/modules/MiningCalc/MData/MObjectBasicData.vue";
    import MObjectPercData from "@/components/modules/MiningCalc/MData/MObjectPercData.vue";
    import MGroupData from "@/components/modules/MiningCalc/MData/MGroupData.vue";
    import MResults from "@/components/modules/MiningCalc/MResults/MResults.vue";
    import MProject from "@/components/modules/MiningCalc/MProject/MProject.vue";

    import { useProjectStore } from "@/stores/project.js";
    import MiningStore from "@/stores/mining.js";
    import mAPI from "@/script/mining.js";

    import { useRoute } from "vue-router";
    const route = useRoute();

    const proj = useProjectStore();
    const level = computed(()=>proj.currentLevel.level);
    
    const Mining = MiningStore();

    const MLevel = computed(()=>Mining.currentLevel.level);

    const props = defineProps({
        groupId: String,
        objectId: String,
    })

//type list
    const typesList = computed(()=>{
        let res = [
            {
                title: 'Ввод исходных данных',
            }
        ]

        if(MLevel.value == "Group"){
            res.push({
                title: 'Результаты расчетов',
                disabled: !Mining.activeGroup.up_to_date_calculation
            })
        }

        if(MLevel.value == "Object"){
            //notdone должен фильтроваться на основании того, что у нас p50 или все
            res[0].list = objectModeList
        }

        return res;
    });

    const objectModeList = reactive({
        key: 'name',
        list: [
            {id: 0, name: '1. Общая информация'},
            {id: 'p90', name: '2.1. Геологический сценарий (P90)'},
            {id: 'p50', name: '2.2. Геологический сценарий (P50)'},
            {id: 'p10', name: '2.3. Геологический сценарий (P10)'},
        ],
        activeItem: {id: 0, name: '1. Общая информация'}
    })

    const typesListDisplay = computed(()=>typesList.value.map((e,k) => 
        Object.assign({},e,{
            click: ()=>Mining.setType(k),
            active: ()=>Mining.type == k
        })
    ));

//type page
    const typePage = computed(()=>
        route.meta?.mining?(
            MLevel.value == "Project"?MProject:
            MLevel.value == "Object"?(
                objectModeList.activeItem.id == 0?
                    MObjectBasicData:
                    MObjectPercData
            ):
            proj.type == 1?
                MResults:
                MGroupData
        ):level.value == "Layer"?VCollection:PCProj
    );

//miningData
    const miningData = ref(null);

    const updateMiningData = ()=>{
        miningData.value = null;

        console.log(MLevel.value, props.groupId, Mining.currentLevel.content?.id);

        if(MLevel.value == "Object"){
            mAPI.object().data.get.input(
                route.params.objectId,
                res=>{
                    console.log('upd')
                    miningData.value = {
                        moved_input_data: parseMiningData(res, 'moved_input_data', 'object_moved_input'),
                        moved_calculated_data: parseMiningData(res, 'moved_calculated_data', 'object_moved_calculated'),
                        input_data: parseMiningInputData(res),
                    }
                }
            );
        }else if(MLevel.value == "Group" && Mining.currentLevel.content?.id){
            console.log('preupd2')
            mAPI.group().data.get.input(
                Mining.currentLevel.content?.id,
                res => {
                    console.log('upd2')
                    miningData.value = {
                        input_data: parseMiningData(res, 'input_data', 'group_calculation_input'),
                    }
                }
            );
        }
    }

    const parseMiningData = (
        resp,
        respKey,
        defaultKey
    )=>{
        let arr = JSON.parse(JSON.stringify(Mining.defaultValues[defaultKey]));

        Object.keys(arr).forEach(key => {
            let val = resp[respKey]?.data?.[key];

            arr[key].value = 
                val ?( 
                    arr[key].array?
                        {
                            p10:  val?.p10 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p10:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p50:  val?.p50 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p50:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p90:  val?.p90 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p90:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0)
                        }:
                        {
                            p10: val?.p10?.[0] != null ? val?.p10?.[0] : val[0] != null ? val[0] : null, 
                            p50: val?.p50?.[0] != null ? val?.p50?.[0] : val[0] != null ? val[0] : null, 
                            p90: val?.p90?.[0] != null ? val?.p90?.[0] : val[0] != null ? val[0] : null
                        }
                ):
                (
                    arr[key].array?
                        {
                            p10: new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p50: new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p90: new Array(useProjectStore().activeProject?.mining_n_years || 0)
                        }:
                        {p10: null, p50: null, p90: null}
                )
        });

        return arr;
    }

    const parseMiningInputData = (resp)=>{
        ['p10', 'p50', 'p90'].forEach(perc => {
            resp[`input_data_${perc}`] = {data: {}};

            Object.keys(resp.input_data?.data || {}).forEach(key => {
                resp[`input_data_${perc}`].data[key] = {p10: null, p50: null, p90: null};
                ['p10', 'p50', 'p90'].forEach(perc2 => {
                    resp[`input_data_${perc}`].data[key][perc2] = resp[`input_data`].data[key][`${perc}${perc2}`]
                })
            });
        })

        return {
            p10: parseMiningData(resp, 'input_data_p10', 'object_calculation_input'),
            p50: parseMiningData(resp, 'input_data_p50', 'object_calculation_input'),
            p90: parseMiningData(resp, 'input_data_p90', 'object_calculation_input'),
        }
    }

    const recalculateArray = (arr)=>{
        let y = useProjectStore().activeProject?.mining_n_years;
        return Object.assign(new Array(y).fill(arr[0]), arr.slice(0, y));
    }

    const startup = ()=>{
        updateMiningData();
    }

    watch(()=>Mining.currentLevel.content?.id, (n)=>{
        if(!n)return;
        updateMiningData();
    });
    onMounted(startup);
</script>

<style lang="scss" scoped>
    .types-nav{
        margin-bottom: 24px;

        :deep(.item){
            font-size: 14px;
        }
    }

    .page-content-wr{
        height: 100%;
    }
</style>