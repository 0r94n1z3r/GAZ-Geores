<template>
    <div></div>
</template>

<script setup>
    import MProject from "@/components/modules/MiningCalc/MProject/MProject.vue";

    import Eco from "@/stores/economics.js";
    import { useProjectStore } from "@/stores/project.js"

    import { onMounted, watch } from "vue";

    const proj = useProjectStore();
    
    const redir = ()=>{
        if(Eco().groups.length)
            Eco().setActiveGroupId(Eco().groups[0].id);
    };

    onMounted(redir);
    watch(()=>proj.activeProjectId, redir);

    
</script>

<style lang="scss" scoped>

</style>