<template>
    <div class="v-content">
        <VNavbar/>
        <div class="page-container">
            <div class="loading-wr" v-if="!Proj.activeProject || Proj.activeProject.loading">
                <VLoading/>    
            </div>
            <RouterView v-else class="page"/>
        </div>
    </div>
</template>

<script setup>
    import VNavbar from "@/components/navbar/VNavbar.vue";
    import { useProjectStore } from "@/stores/project.js";

    const Proj = useProjectStore();
</script>

<style lang="scss" scoped>
    .v-content{
        display: flex;
        height: 100%;

        .navbar{
            width: 100%;
            max-width: 363px;
            flex-shrink: 0;
        }

        .page-container{
            width: 100%;
            overflow-y: auto;
        }

        .loading-wr{
            height: 100%;
            width: 100%;
            @include flex-c;
        }
    }
</style>