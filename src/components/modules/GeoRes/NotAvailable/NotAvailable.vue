<template>
    <div>
        <h1>Для оценки запасов заполните хотя бы одну залежь</h1>
    </div>
</template>

<script setup>
    import { useProjectStore } from "@/stores/project.js";

    const proj = useProjectStore();
</script>

<style lang="scss" scoped>

</style>