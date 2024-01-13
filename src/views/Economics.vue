<template>
    <LayContentPage>
        <PageNavigation :list="typesListDisplay" class="types-nav" v-if="route.meta.group"/>
        <Component class="page-content-wr" :is="typePage"/>
    </LayContentPage>
</template>

<script setup>
    import { computed, onMounted, reactive, ref, watch } from "vue";

    import EData from "@/components/modules/Economics/EData/EData.vue";
    import EResults from "@/components/modules/Economics/EResults/EResults.vue";
    import EProj from "@/components/modules/Economics/EProj/EProj.vue";

    import LayContentPage from "@/components/layouts/LayContentPage.vue";

    import PageNavigation from "@/components/page/PageNavigation.vue";

    import { useProjectStore } from "@/stores/project.js";
    import Eco from "@/stores/economics.js";

    import { useRoute } from "vue-router";
    const route = useRoute();

    const proj = useProjectStore();
    const level = computed(()=>proj.currentLevel.level);

//type list
    const typesList = computed(()=>
        [
            {
                title: 'Ввод исходных данных',
            }, 
            {
                title: 'Результаты расчетов',
                disabled: !Eco().activeModel?.up_to_date_calculation
            },
        ]
    )

    const typesListDisplay = computed(()=>typesList.value.map((e,k) => 
        Object.assign({},e,{
            click: ()=>Eco().setType(k),
            active: ()=>proj.type == k
        })
    ));

//type page
    const typePage = computed(()=>
        route.meta?.group?
            proj.type == 1?
                EResults:
                EData
        :EProj
    );

</script>

<style lang="scss" scoped>
    .page-content-wr{
        height: 100%;
    }

    .types-nav{
        margin-bottom: 24px;

        :deep(.item){
            font-size: 14px;
        }
    }
</style>