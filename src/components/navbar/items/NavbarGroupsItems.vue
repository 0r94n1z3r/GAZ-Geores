<template>
    <div class="eco-items">
        <NavbarGroupsItem 
            v-for="(group, g) in groups" 
            :key="g"
            @callback="emit('setGroup', group.id)"
            :item="group"
            :search="search"
        >
            <NavbarGroupsItem 
                v-for="(obj, o) in group.mining_objects" 
                :key="o"
                :item="obj"
                :search="search"
                :no-drop="!obj.layers?.length"
                inactive
            >
                <NavbarGroupsItem 
                    v-for="(lay, l) in obj.layers" 
                    :key="l"
                    :item="proj.findLayer(lay)"
                    :search="search"
                    :parent-obj="obj"
                    inactive
                />
            </NavbarGroupsItem>
        </NavbarGroupsItem>
    </div>
</template>

<script setup>
    import NavbarGroupsItem from "./NavbarGroupsItem.vue";
    import NavbarGroupsItems from "./NavbarGroupsItems.vue";
    
    import { computed, onMounted, ref, watch } from 'vue';

    import { useProjectStore } from "@/stores/project.js";
    
    const proj = useProjectStore();

    const props = defineProps({
        search: String,
        groups: Array
    })    

    const emit = defineEmits(['setGroup']);

</script>

<style lang="scss">
    .sortable-ghost{
        opacity: 0;
    }

    .eco-items{
        padding-left: 0!important;
    }
</style>