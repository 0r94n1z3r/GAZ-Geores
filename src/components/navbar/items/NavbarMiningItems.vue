<template>
    <div class="mining-items">
        <NavbarMiningItem 
            v-for="(group, g) in Mining.groups" 
            :key="g"
            @callback="groupCallbackHandler"
            :item="group"
            :search="search"
        >
            <NavbarMiningItem 
                v-for="(obj, o) in group.mining_objects" 
                :key="o"
                @callback="objectCallbackHandler"
                :item="obj"
                :search="search"
                :no-drop="!obj.layers?.length"
            >
                <NavbarMiningItem 
                    v-for="(lay, l) in obj.layers" 
                    :key="l"
                    @callback="layerCallbackHandler"
                    :item="proj.findLayer(lay)"
                    :search="search"
                    :parent-obj="obj"
                />
            </NavbarMiningItem>
            <NavbarAddBtn text="Добавить ОР" @click="Mining.newObject(group)"/>
        </NavbarMiningItem>

        <NavbarAddBtn text="Добавить группу ОР" @click="Mining.newGroup()"/>
    </div>
</template>

<script setup>
    import NavbarMiningItem from "./NavbarMiningItem.vue";
    import NavbarMiningItems from "./NavbarMiningItems.vue";
    import NavbarAddBtn from "../NavbarAddBtn.vue";
    
    import { computed, onMounted, ref, watch } from 'vue';

    import { useProjectStore } from "@/stores/project.js";
    import MiningStore from "@/stores/mining.js";
    
    const proj = useProjectStore();
    const Mining = MiningStore();

    const props = defineProps({
        search: String
    });

//callback handlers
    const groupCallbackHandler = (mode, id)=>{
        switch(mode){
            case "go":
               Mining.setActiveGroupId(id);
        }
    } 
    
    const objectCallbackHandler = (mode, id, groupId)=>{
        switch(mode){
            case "go":
               Mining.setActiveObjectId(groupId, id);
        }
    }

    const layerCallbackHandler = (mode, id)=>{
        switch(mode){
            case "go":
                proj.setActiveLayerId(proj.findLayerParent(id).id, id);
        }
    }
    

</script>

<style lang="scss">
    .sortable-ghost{
        opacity: 0;
    }
</style>