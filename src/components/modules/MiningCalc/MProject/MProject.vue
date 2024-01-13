<template>
    <LayFooterPage reversed :hideFooter="true">
        <h1>1. Определение периода расчета</h1>

        <div class="inp-wr">
            <div class="title">Год начала расчета</div>
            <VTextInput v-model="Proj.activeProject.mining_start_year" type="number" blurOnly borders="[1;]"/>
        </div>
        <div class="inp-wr">
            <div class="title">Период расчета, лет</div>
            <VTextInput v-model="Proj.activeProject.mining_n_years" type="number" blurOnly borders="[1;]"/>
        </div>

        <template #footer>
            <div class="footer-container">
                <VButton grey>Оценка профилей добычи</VButton>
            </div>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { ref, watch } from "vue";

    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import { useProjectStore } from "@/stores/project.js";
    import mStruct from "@/script/structure.js"

    const props = defineProps({
        yearKey: {
            type: String,
            default: 'mining'
        },
        disabled: Boolean,
    });

    const Proj = useProjectStore();

    watch(()=>Proj.activeProject[`${props.yearKey}_start_year`], n=>{mStruct.Project.edit(Proj.activeProject.id, {[`${props.yearKey}_start_year`]: n})});
    watch(()=>Proj.activeProject[`${props.yearKey}_n_years`], n=>{mStruct.Project.edit(Proj.activeProject.id, {[`${props.yearKey}_n_years`]: n})});
</script>

<style lang="scss" scoped>
    h1{
        margin-bottom: 20px;
    }

    .inp-wr{
        display: flex;
        padding: 8px 0;

        .title{
            min-height: 30px;
            padding-top: 5px;
            display: flex;
            width: 200px;
            flex-shrink: 0;
        }
        
        .input{
            width: 130px;
        }
    }

    .footer-container .btn{
        height: 32px;
        width: max-content;
        padding: 0 16px 1px;
        font-size: 14px;
    }
</style>