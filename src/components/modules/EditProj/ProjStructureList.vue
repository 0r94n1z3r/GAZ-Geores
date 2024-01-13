<template>
    <VDraggable 
        :list="list"
        class="list-group"
        :component-data="{
          type: 'transition-group',
          ghostClass: 'sortable-ghost'
        }"
        v-bind="{
            animation: 200,
        }"
        item-key="id"
        handle=".grip"
    >
        <template #item="{element, index}">
            <ProjStructureItem 
                :item="element"
                :title="title"
                :parentList="list"
                :localId="index"
                :isEdit="isEdit"
            />
        </template>
    </VDraggable>
</template>

<script setup>
    import VDraggable from 'vuedraggable';
    import ProjStructureItem from "./ProjStructureItem.vue";

    const props = defineProps({
        list: Array,
        title: String,
        parentList: Array,
        isEdit: Boolean,
    });
</script>

<style lang="scss" scoped>
   
</style>