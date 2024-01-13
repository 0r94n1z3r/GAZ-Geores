<template>
    <div>
        <div class="title">
            <h1>Визуализация результатов</h1>            
        </div>
        <MRScenes style="margin-bottom: 12px" v-model="Mining.chartScenes"/>
        <MRLegend :data="data"/>
        <MRChart :data="data"/>
    </div>
</template>

<script setup>
    import MRLegend from "@/components/modules/MiningCalc/MResults/ui/MRLegend.vue";
    import MRChart from "@/components/modules/MiningCalc/MResults/ui/MRChart.vue";
    import MRScenes from "@/components/modules/MiningCalc/MResults/ui/MRScenes.vue";

    import MiningStore from '@/stores/mining.js';
    
    import { ref, watch } from "vue";

    const props = defineProps({
        data: Object
    });

    const Mining = MiningStore();
</script>

<style lang="scss" scoped>

</style>