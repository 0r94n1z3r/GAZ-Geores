<template>
    <div class="m-r-table">
        <div class="title">
            <h1>Табличная информация</h1>
        </div>

        <MRscenes class="scenes" only v-model="scene"/>

        <VLoading v-if="scene?.[0]?.loading"/>

        <div class="table-wr" v-else-if="scene?.[0]">
            <table class="table-default">
                <thead>
                    <tr>
                        <th v-for="i in head" :key="i.key">{{i.value?.verbose_name}}{{i.value?.units && `, ${i.value?.units}`}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(i,k) in data" :key="k">
                        <td v-for="(j,f) in i" :key="f">
                            {{f==0?
                                Proj.activeProject.mining_start_year+j:
                                (
                                    j?
                                        parseFloat(j).toFixed(3):
                                        j
                                )
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";
    import MRscenes from '@/components/modules/MiningCalc/MResults/ui/MRScenes.vue';

    import Mining from '@/stores/mining.js';
    import {useProjectStore} from '@/stores/project.js';

    const props = defineProps({
        data: Object
    });

    const emit = defineEmits(['updateScene']);

    const Proj = useProjectStore();

    const scene = ref([]);

    watch(()=>scene?.[0]?.name, (n)=>{
        if(n){
            updateObjectData(
                n, 
                n.id || Mining().activeGroup.id,
                type,
                n.list?n.list.map(e => e.p):[n.p]
            );
        }
    })

    const head = computed(()=>
        Mining().defaultValues.calculation_output_table_columns?.map(e => {
            return {key: e, value: Mining().defaultValues.calculation_output[e]}
        }) || []
    );

    const data = computed(()=>{
        let obj = props.data[sceneKey(scene.value[0])];

        if(!obj){
            if(scene.value[0])emit('updateScene', scene.value[0]);
            return [];
        }

        return Object.values(obj)?.[0]?.map?.((f,k) => head.value.map(e => obj[e.key]?.[k])) || [];
    })

    const sceneKey = (scene)=>scene.list?scene.title:`${scene.title} [${scene.id}]`

    const updateObjectData = (scene, id, type, percs)=>{
        scene.loading = true;

        mAPI[type.toLowerCase()]().data.get.output(
            id, //Mining().activeGroup.id,
            percs, //[[10,90], [...], ...],
            res=>{
                scene.loading = false;
                
                data.value[sceneKey(scene)] = res;
                visibleData.value[sceneKey(scene)] = res;

                console.log(data.value)
            }
        );
    }
</script>

<style lang="scss" scoped>
    .m-r-table{
        min-height: 40vh;
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
    }
</style>