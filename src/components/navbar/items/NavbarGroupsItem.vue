<template>
    <div class="navbar-item" :loading="item.loading || null" v-show="hasSearch">
        <div class="item-content" :inactive="inactive || null" :active="isActive || null">
            <div class="container" @click="emit('callback', 'go', item.id, item.group)">
                <div class="drop" @click.stop="item.drop = !item.drop" :style="{transform: item.drop?`rotate(.5turn)`:null}" v-if="$slots.default && !noDrop"><IDropArr/></div>
                <div class="drop" fake v-else></div>
                <div class="status" :active="status || null">
                    <div class="status-block"></div>
                </div>
                <div class="name">{{item.name}}</div>
                <div class="type" v-if="fluidType">({{fluidType}})</div>
            </div>
        </div>
        <div class="drop-container" :style="{height: dropHeight}">
            <slot/>
        </div>
        <div class="drop-container" ref="fakeDrop" fake :style="{height: 'auto'}">
            <slot/>
        </div>
        <VLoading class="loading" hollow v-if="item.loading"/>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";

    import { useProjectStore } from "@/stores/project.js";
    import MiningStore from "@/stores/mining.js";
    import { useDistributionStore } from "@/stores/distribution.js";
    
    import ICross from "@/components/icons/ICross.vue";
    
    const proj = useProjectStore();
    const Mining = MiningStore();
    const Distr = useDistributionStore();

    import IDropArr from '@/components/icons/IDropArr.vue';

    const props = defineProps({
        item: Object,
        search: String,
        noDrop: Boolean,
        parentObj: Object,
        inactive: Boolean,
    })

    const emit = defineEmits(['callback']);

//drop
    const dropHeight = ref(props.item.drop?'auto':0);
    const fakeDrop = ref();

    watch(()=>props.item.drop, (n)=>{
        if(!fakeDrop.value)return;
        dropHeight.value = fakeDrop.value.getBoundingClientRect().height + 'px';
        if(!n){
            setTimeout(()=>{ dropHeight.value = 0 })
        }else{ 
            setTimeout(()=>{ dropHeight.value = 'auto' }, 301)
        }
    })

//active
    const isActive = computed(()=>{
        switch(proj.currentLevel.level){
            case "Layer":
                return props.item.id == proj.activeLayer.id && !!props.item.fluid_type;
            case "Sensor":
                return props.item.id == proj.activeSensor.id && !!props.item.layers;
        }

        switch(Mining.currentLevel?.level){
            case "Object":
                return props.item.id == Mining.activeObject.id && !!props.item.layers;
            case "Group":
                return props.item.id == Mining.activeGroup.id && !!props.item.mining_objects;
        }

        return false;
    })

//status
    const status = computed(()=>props.item.has_all_data)

//fluid
    const fluidType = computed(()=>{
        switch (props.item.fluid_type){
            case "gas": return "газ";
            case "oil": return "нефть";
            default: return null;
        }
    })

//search
    const strIncludes = (str1, str2)=>{
        return str1.toLowerCase().includes(str2.toLowerCase());
    }

    const hasSearch = computed(()=>
        strIncludes(props.item?.name || '', props.search) || 
        (
            props.item.layers?.length &&
            props.item.layers.some(e => strIncludes(e.name || '', props.search))
        )
    )
</script>

<style lang="scss" scoped>
    .navbar-item{
        &[loading]{
            .item-content{
                opacity: .3;
            }

            .loading{
                position: absolute;
                @include all-directions(0);
                margin: auto;
                height: 100%;
            }

            pointer-events: none;
        }

        .drop-container[fake]{
            @include hidden(0);
            position: absolute;
        }
    }
</style> 