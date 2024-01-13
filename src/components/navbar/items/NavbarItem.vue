<template>
    <div class="navbar-item" 
        :selected="item.selected || null" 
        :drop="item.drop || null" 
        :loading="item.loading || null" 
        :inactive="isMiningObject || null"
        v-show="hasSearch"
    >
        <div class="item-content" :active="isActive || null">
            <div class="container" @click="()=>{
                if(!isMiningObject){
                    emit('callback', item.id)
                }
            }">
                <div class="drop" @click.stop="item.drop = !item.drop" v-if="item.layers"><IDropArr/></div>
                <div class="drop" fake v-else></div>
                <div class="status" :active="status || null">
                    <!-- <div class="hint">Вероятностная оценка запасов {{!false?'не ':''}}выполнена</div> -->
                    <!-- <div class="hint-triangle"></div> -->
                    <div class="status-block"></div>
                </div>
                <div class="name">{{item.name}}</div>
                <div class="type" v-if="fluidType">({{fluidType}})</div>
            </div>
            <div class="controls">
                <div class="cas-controls" v-if="route.meta?.mode != 'MiningCalc'">
                    <div class="ico-wr" @click="clone"><ICopy class="ico"/></div>
                    <div class="ico-wr grip"><IGrip class="ico"/></div>
                </div>
                <div class="checkbox-wr" v-if="isMiningObject && item.fluid_type == 'gas'">
                    <div class="ico-wr">
                        <label class="checkbox"><input v-model="item.selected" type="checkbox"><span></span></label>
                    </div>
                </div>
            </div>
        </div>
        <div class="drop-container" :style="{height: item.drop && item.layers?(item.layers.length+1) * 40 + 'px':0}">
            <NavbarItems 
                v-if="item.layers"
                :list="item.layers"
                :id="item.id"
                @callback="proj.setActiveLayerId(item.id, $event)"
                :search="search"
            />
            <NavbarAddBtn text="Добавить залежь" @click="proj.addProjectItem(-1, 'newLayer', item.layers, item.id)"/>
        </div>
        <VLoading class="loading" hollow v-if="item.loading"/>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    
    import IDropArr from '@/components/icons/IDropArr.vue';
    import IPlus from '@/components/icons/IPlus.vue';
    import ICopy from '@/components/icons/ICopy.vue';
    import IGrip from '@/components/icons/IGrip.vue';
    
    import NavbarItems from "./NavbarItems.vue"; 
    import NavbarAddBtn from "../NavbarAddBtn.vue"; 

    import { useProjectStore } from "@/stores/project.js";
    import { useDistributionStore } from "@/stores/distribution.js";
    import MiningStore from "@/stores/mining.js";
    import { useRoute } from 'vue-router';

    import APIstruct from "@/script/structure.js"

    const emit = defineEmits(['callback']);

    const props = defineProps({
        item: Object,
        localId: Number,
        parentList: Array,
        parentId: [Number, String],
        search: String,
    });

    const proj = useProjectStore();
    const Distr = useDistributionStore();
    const Mining = MiningStore();

    const route = useRoute();

    const isMiningObject = computed(()=>
        !props.item.layers && route.meta?.mode == 'MiningCalc'
    );

    const level = computed(()=>
        props.item.fluid_type?
            "Layer":
        props.item.layers?
            "Sensor":
            "Project"
    );

    const fluidType = computed(()=>{
        switch (props.item.fluid_type){
            case "gas": return "газ";
            case "oil": return "нефть";
            default: return null;
        }
    })

    const isActive = computed(()=>{
        switch(proj.currentLevel.level){
            case "Layer":
                return props.item.id == proj.activeLayer.id && !!props.item.fluid_type;
            case "Sensor":
                return props.item.id == proj.activeSensor.id && !!props.item.layers;
        }
        return false;
    })

    const status = computed(()=>{
        let content = props.item;
        
        if(content.fluid_type){
            content.has_all_data = hasAllDists(content);
        }else if(content.layers?.length){
            content.has_all_data = content.layers.every(e => hasAllDists(e));
        }else if(content.sensors?.length){
            content.has_all_data = content.sensors.every(s => s.layers.every(e => hasAllDists(e)));
        }
        return content.has_all_data;
    })

    const hasAllDists = (item)=>{
        return item.fluid_type != 'empty' && 

        (
            Object.keys(item?.input_constants || {}).length 
            ==  
            Object.keys(Distr.columns?.input_constants?.[item.fluid_type] || {}).length
        ) &&

        !!Object.keys(item?.distribution_data?.columns || {}).length &&

        (
            Object.keys(item?.distribution_data?.columns || {})
            .filter( e => item?.distribution_data?.columns[e]?.distribution).length 
            == 
            Object.keys(Distr.columns?.input_columns?.[item.fluid_type] || {}).length
        )
    }

    const clone = ()=>{
        let itm = JSON.parse(JSON.stringify(props.item));
        itm.loading = true;
        itm.name += ' (Копия)';

        props.parentList.splice(props.localId+1, 0, itm);
        
        APIstruct[level.value].clone(props.item.id, (res)=>{
            props.parentList[props.localId+1] = res;
            res.name += ' (Копия)';

            APIstruct[level.value].edit(res.id, {
                order: props.localId+1,
                name: itm.name
            });
        });
    }

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
        &[drop] .drop{
            transform: rotate(.5turn);
        }

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

        &[inactive]{
            .item-content:hover{
                cursor: default;
                background: transparent !important;
            }
        }

        .checkbox{
            width: 16px;
            height: 16px;
            padding: 0;
        }

        &:not(:hover){
            .checkbox-wr{
                width: 0;
            }   
        }

        &[selected]{
            .checkbox-wr{
                width: auto!important;
            }
        }
    }
</style>