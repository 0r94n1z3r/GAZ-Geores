<template>
    <LayFooterPage reversed :hideFooter="$route.meta?.mode == 'MiningCalc' ? (info.fluid_type != 'gas' || !Mining.groups?.length) : !info.has_all_data">
        <FluidType 
            v-if="info.fluid_type" 
            :info="info" 
            :disabled="!!Object.keys(info.distribution_data?.columns || {})?.filter(k => info.distribution_data?.columns[k].distribution)?.length"

            @update="n => proj.editProjectItem(info, 'Layer', {fluid_type: n})"
        />

        <DataConsts :info="info" v-if="info.fluid_type && info.fluid_type != 'empty'"/>

        <DataTable :info="info" v-if="info.fluid_type && info.fluid_type != 'empty'"/>
        
        <template #footer>
            <div class="footer-container">
                <template v-if="$route?.meta.mode == 'MiningCalc'">
                    <div class="add-to-mining-object-wr" v-if="Mining.groups?.length">
                        <VButton
                            grey
                            @click="addToMiningObject()"
                        >
                            <IPlus/>
                            Добавить {{proj.selectedLayers?.length?`(${proj.selectedLayers.length})`:''}} в ОР
                        </VButton>
                        <TextSelect
                            v-model="selectedMiningObject"
                            keyName="name"
                            :list="Mining.allObjects"
                            rev
                        />
                    </div>
                </template>

                <template v-else>
                    <div class="real">
                        <p>Количество реализаций, ед.</p>
                        <VTextInput type="number" borders="[0;]" err-absolute="top" v-model.number="info.n" :placeholder="1000"/>
                    </div>
                    
                    <VButton class="evaluate-btn" @click="proj.setType(1)">Выполнить оценку запасов</VButton>
                </template>
                
            </div>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { computed, ref, watch } from "vue";

    import FluidType from "./FluidType.vue";
    import DataTable from "./DataTable.vue";

    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";
    import TextSelect from "@/components/ui/TextSelect.vue";

    import DataConsts from '@/components/modules/GeoRes/Collection/DataConsts.vue';

    import { useProjectStore } from "@/stores/project.js";
    import MiningStore from "@/stores/mining.js";
    
    import IPlus from "@/components/icons/IPlus.vue";


    const proj = useProjectStore();
    const Mining = MiningStore();

    const info = computed(()=>proj.currentLevel.content);

    watch(()=>info.value.n, ()=>{
        info.value.up_to_date_simulation = false;
    });

//selectedMiningObject
    const selectedMiningObject = ref(Mining.allObjects?.[0]);

    watch(()=>proj.activeProject.id, ()=>selectedMiningObject.value = Mining.allObjects?.[0])

//addToMIningObject
    const addToMiningObject = ()=>{
        Mining.addLayersToObject(
            [info.value.id],
            selectedMiningObject.value
        );
    }
</script>

<style lang="scss" scoped>
    .fluid-type, .data-table, .consts{
        margin-bottom: 24px;
    }

    .evaluate-btn.btn{
        height: 32px;
        width: max-content;
        padding: 0 16px 1px;
    }

    .footer-container{
        display: flex;
        align-items: center;
        gap: 20px;

        .real{
           display: flex;
            align-items: center;
            gap: 10px; 
            
            p{
                white-space: nowrap;
                font-size: 16px;
                color: var(--typo-control-ghost);
            }

            .input{
                width: 60px;
            }
        }
    }

    .add-to-mining-object-wr{
        display: flex;
        gap: 11px;

        .btn{
            white-space: nowrap;
            font-size: 14px;
            height: 32px;
            padding: 4px 12px;
            width: max-content;
        }
    }
</style>