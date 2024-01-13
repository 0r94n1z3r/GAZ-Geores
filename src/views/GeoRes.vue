<template>
    <LayContentPage>
        <PageNavigation :list="typesListDisplay" class="types-nav" v-if="level == 'Layer'"/>
        <Component class="page-content-wr" :is="typePage"/>
        <EvalInfoModal ref="infoModal"/>
    </LayContentPage>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from "vue";

    import LayContentPage from "@/components/layouts/LayContentPage.vue";

    import PageNavigation from "@/components/page/PageNavigation.vue";

    import VCollection from "@/components/modules/GeoRes/Collection/VCollection.vue";
    import VEvaluation from "@/components/modules/GeoRes/Evaluation/VEvaluation.vue";
    import NotAvailable from "@/components/modules/GeoRes/NotAvailable/NotAvailable.vue";

    import EvalInfoModal from "@/components/modules/GeoRes/Evaluation/EvalInfoModal.vue";

    import { useProjectStore } from "@/stores/project.js";

    const proj = useProjectStore();

    const level = computed(()=>proj.currentLevel.level);

    const infoModal = ref();

    const typesList = computed(()=>[
        {
            title: 'Ввод исходных данных',
        },
        {
            title: 'Результаты расчетов',
            disabled: !proj.currentLevel.content.has_all_data,
            info: infoModal.value
        },
    ]);

    const typesListDisplay = computed(()=>typesList.value.map((e,k) => 
        Object.assign({},e,{
            click: ()=>proj.setType(k),
            active: ()=>proj.type == k
        })
    ));

    const typePage = computed(()=>{
        return level.value == "Layer"?
            proj.type == 1?
            VEvaluation:
            VCollection
        :level.value == "Sensor"?
            proj.currentLevel.content.layers.some(e => e.has_all_data)?
            VEvaluation:
            NotAvailable
        :
            proj.currentLevel.content.sensors?.map(e => e.layers).flat().some(e => e.has_all_data)?
            VEvaluation
            :NotAvailable
    })

    // watch(typePage, (n)=>console.log(n))
    
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