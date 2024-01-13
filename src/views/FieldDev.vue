<template>
    <LayContentPage>
        <PageNavigation :list="typesListDisplay" class="types-nav" v-if="route.meta.group"/>
        <Component class="page-content-wr" :is="typePage"/>
    </LayContentPage>
</template>

<script setup>
    import { computed, onMounted, reactive, ref, watch } from "vue";

    import FdData from "@/components/modules/FieldDev/FdData/FdData.vue";
    import FdResults from "@/components/modules/FieldDev/FdResults/FdResults.vue";
    import FdProj from "@/components/modules/FieldDev/FdProj/FdProj.vue";

    import LayContentPage from "@/components/layouts/LayContentPage.vue";
    import PageNavigation from "@/components/page/PageNavigation.vue";

    import { useProjectStore } from "@/stores/project.js";
    import FD from "@/stores/fieldDev.js";

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
                disabled: !FD().activeModel?.up_to_date_calculation
            },
        ]
    )

    const typesListDisplay = computed(()=>typesList.value.map((e,k) => 
        Object.assign({},e,{
            click: ()=>FD().setType(k),
            active: ()=>proj.type == k
        })
    ));

//type page
    const typePage = computed(()=>
        route.meta?.group?
            proj.type == 1?
                FdResults:
                FdData
        :FdProj
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