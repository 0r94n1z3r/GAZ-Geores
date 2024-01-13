<template>
    <div></div>
</template>

<script setup>
    import MProject from "@/components/modules/MiningCalc/MProject/MProject.vue";

    import FD from "@/stores/fieldDev.js";
    import { useProjectStore } from "@/stores/project.js";

    import { onMounted, watch } from "vue";

    const proj = useProjectStore();

    const redir = ()=>{
        if(FD().groups.length)
            FD().setActiveGroupId(FD().groups[0].id);
    }

    onMounted(redir);
    watch(()=>proj.activeProjectId, redir);
</script>

<style lang="scss" scoped>

</style>