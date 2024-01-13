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

        @change="moved"
    >
        <template #item="{element, index}">
            <NavbarItem 
                :item="element"
                :localId="index"
                :parentId="id"
                :parentList="list"
                @callback="emit('callback', $event)"
                :search="search"
            />
        </template>
    </VDraggable>
</template>

<script setup>
    import VDraggable from 'vuedraggable';
    import NavbarItem from "./NavbarItem.vue";

    import { computed, onMounted, ref, watch } from 'vue';

    import APIstruct from "@/script/structure.js";

    const emit = defineEmits(['callback']);

    const props = defineProps({
        list: Array,
        id: [Number, String],
        search: String
    });

    const moved = (e)=>{
        if(e.moved){
            let el = e.moved.element;
            APIstruct[el.fluid_type?'Layer':'Sensor'].edit(el.id, {order: e.moved.newIndex});
        }
    }
</script>

<style lang="scss">
    .sortable-ghost{
        opacity: 0;
    }
</style>