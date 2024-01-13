<template>
    <div 
        class="navbar aside-navbar" 
        :no-project="!proj.activeProjectDisplay || null" 
        :drop="(drop && hasNav) || null" 
        :hasNav="hasNav || null"
    >
        <div class="top">
            <h1 class="top-title">Панель навигации</h1>
            <div class="drop-arr" @click="drop = !drop">
                <ICallArr class="ico"/>
            </div>
        </div>

        <div class="content">
            <ProjectsDrop @search="search = $event"/>

            <div class="lists-wr">
                <div class="list-wr" v-if="!route.meta?.groupsOnly">
                    <div class="navbar-item" @click="proj.goToSameProject()">
                        <div class="item-content">
                            <div class="container">
                                <div class="drop" @click.stop="drops[0] = !drops[0]" :style="{transform: drops[0]?`rotate(.5turn)`:null}"><IDropArr/></div>
                                <h4 class="name">Геологические объекты</h4>
                            </div>
                        </div>
                    </div>
                    <div class="list" :style="{height: dropsHeight[0]}">
                        <NavbarItems :list="proj.sensors" :search="search" :id="proj.activeProject.id" @callback="proj.setActiveSensorId($event)"/>
                        <NavbarAddBtn text="Добавить пласт" v-if="proj.activeProjectDisplay" @click="proj.addProjectItem(-1, 'newSensor', proj.sensors, proj.activeProject.id)"/>
                    </div>
                    <div class="list" fake :ref="e => fakeDrops[0] = e">
                        <NavbarItems :list="proj.sensors" :search="search" :id="proj.activeProject.id"/>
                        <NavbarAddBtn text="Добавить пласт" v-if="proj.activeProjectDisplay"/>
                    </div>
                    <div class="add-to-mining-object-wr" v-if="Mining.groups?.length && $route.meta?.mode == 'MiningCalc'">
                        <VButton
                            grey
                            :disabled="!proj.selectedLayers?.length || null"
                            @click="addToMiningObject()"
                        >
                            <IPlus/>
                            Добавить {{proj.selectedLayers?.length?`(${proj.selectedLayers.length})`:''}} в ОР
                        </VButton>
                        <TextSelect
                            v-model="selectedMiningObject"
                            keyName="name"
                            :list="Mining.allObjects"
                        />
                    </div>
                </div>

                <div class="list-wr" v-if="$route.meta?.mode == 'MiningCalc'">
                    <div class="navbar-item" @click="Mining.goToMiningProject()">
                        <div class="item-content" :active="$route.name == 'MiningCalc_Mining_Project' || null">
                            <div class="container">
                                <div class="drop" @click.stop="drops[1] = !drops[1]" :style="{transform: drops[1]?`rotate(.5turn)`:null}"><IDropArr/></div>
                                <h4 class="name">Объекты разработки</h4>
                            </div>
                        </div>
                    </div>
                    <NavbarMiningItems :search="search" class="list" :style="{height: dropsHeight[1]}"/>
                    <div fake :ref="e => fakeDrops[1] = e" class="list">
                        <NavbarMiningItems :search="search"/>
                    </div>
                </div>

                <div class="list-wr" v-if="route.meta.groupsOnly">
                    <NavbarGroupsItems 
                        class="list" 
                        :search="search"
                        :style="{height: dropsHeight[1]}"
                        :groups="activeModeStore.groups"
                        @setGroup="setGroup($event)"
                    />
                    <div fake :ref="e => fakeDrops[1] = e" class="list">
                        <NavbarGroupsItems 
                            :search="search"
                        />
                    </div>
                </div>
                
            </div>

            <div class="btns">
                <VButton @click="proj.newProject()"><IPlus/><span>Добавить проект</span></VButton>
                <VButton hollow :loading="loading || null" @click="downloadProject"><IDownload/><span>Скачать проект</span></VButton>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import ProjectsDrop from "@/components/navbar/ProjectsDrop.vue";
    import IDownload from "@/components/icons/IDownload.vue";
    import IPlus from "@/components/icons/IPlus.vue";
    import ICallArr from "@/components/icons/ICallArr.vue";
    import IDropArr from '@/components/icons/IDropArr.vue';

    import NavbarItems from "./items/NavbarItems.vue"; 
    import NavbarMiningItems from "./items/NavbarMiningItems.vue"; 
    import NavbarGroupsItems from "./items/NavbarGroupsItems.vue"; 
    import NavbarAddBtn from "./NavbarAddBtn.vue"; 

    import TextSelect from "@/components/ui/TextSelect.vue";

    import { Distribution } from "@/script/distribution.js"

    import { useProjectStore } from "@/stores/project.js";
    import MiningStore from "@/stores/mining.js";
    import EcoStore from "@/stores/economics.js";
    import FDStore from "@/stores/fieldDev.js";

    import { useRouter, useRoute } from 'vue-router';
    
    const router = useRouter();
    const route = useRoute();

    const proj = useProjectStore();
    const Mining = MiningStore();
    const Eco = EcoStore();
    const FD = FDStore();

    const loading = ref(false);
    const downloadProject = ()=>{
        loading.value = true;
        
        Distribution.download.project(
            proj.activeProjectDisplay?.id,
            ()=>{
                loading.value = false;
            }
        )
    }

//list
    const search = ref('');
    
    // const list = computed(()=>{
    //     let res = proj.sensors
    //     ?.
    //     map(e => {
    //         let r = e;//JSON.parse(JSON.stringify(e));
    //         r.layers = r.layers.filter(i => strIncludes(i?.name || '', search.value));
    //         return r;
    //     }).
    //     filter(
    //         e => strIncludes(e?.name || '', search.value) || e.layers.length
    //     );

    //     // if(search.value){
    //     //     res.forEach(e => {
    //     //         if(e.layers.length)e.drop = true;
    //     //     });
    //     // }

    //     console.log(res);

    //     return res;
    // });

    const strIncludes = (str1, str2)=>{
        return str1.toLowerCase().includes(str2.toLowerCase());
    }

//drop
    const drop = ref(true);
    const hasNav = computed(()=>router.currentRoute.value.meta.hasNav);

//drops
    const drops = ref([true, true, true]);
    const dropsHeight = ref(['auto', 'auto']);
    const fakeDrops = ref([null, null])

    watch(()=>[...drops.value], (n,o)=>{
        let id = n[0]!=o[0]?0:1;
        dropsHeight.value[id] = fakeDrops.value[id].getBoundingClientRect().height + 'px';
        if(!n[id]){
            setTimeout(()=>{dropsHeight.value[id] = 0 })
        }else{ 
            setTimeout(()=>{dropsHeight.value[id] = 'auto' }, 301)
        }
    })

//selectedMiningObject
    const selectedMiningObject = ref(Mining.allObjects?.[0]);

    watch(()=>proj.activeProject.id, ()=>selectedMiningObject.value = Mining.allObjects?.[0])

//addToMIningObject
    const addToMiningObject = ()=>{
        Mining.addLayersToObject(
            proj.selectedLayers.map(e => e.id),
            selectedMiningObject.value
        );
        proj.flushSelectedLayers();
    }

//group
    const activeModeStore = computed(()=>
        route.meta?.mode == 'Economics'?Eco:FD
    )

    const setGroup = (id)=>{
        activeModeStore.value.setActiveGroupId(id);
    }

</script>

<style lang="scss">
    .aside-navbar{
        .navbar-item{
            position: relative;
            overflow: hidden;

            &>.item-content{
                height: 40px;
                @include flex-jtf;
                gap: 4px;
                width: 100%;
                
                padding: 0 12px;

                transition: .3s;

                &:not([inactive]){
                    cursor: pointer;
                }

                &:hover:not([inactive]), &[active]{
                    background: var(--bg-stripe);
                }

                &:active:not([inactive]){
                    transition: .01s;
                    background: var(--bg-secondary);
                }

                .container{
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 0;
                    width: 100%;

                    .drop{
                        height: 32px;
                        width: 32px;
                        margin: 0 -8px;
                        cursor: pointer;
                        flex-shrink: 0;
                        @include flex-c;
                        transition: .3s;

                        &[fake]{
                            pointer-events: none;
                        }
                    }
                }

                .status{
                    --color: var(--bg-border);
                    transition: .3s;

                    &[active]{
                        --color: var(--bg-success);
                    }

                    &-block{
                        position: relative;

                        width: 16px;
                        height: 16px;

                        border: 1px solid var(--color);
                        border-radius: 4px;

                        flex-shrink: 0;

                        &::before{
                            @include pseudo-absolute;
                            @include all-directions(0);
                            margin: auto;
                            height: 10px;
                            width: 10px;
                            border-radius: 2px;
                            background: var(--color);
                        }
                    }
                    

                    .hint{
                        position: absolute;

                        bottom: calc(100% - 2px);
                        left: 0;
                        margin-left: 5%;

                        background: var(--bg-default);
                        border-radius: 4px;
                        width: 90%;

                        padding: 4px 10px;

                        box-shadow: 0px 8px 24px 0px #0020331F;
                        box-shadow: 0px 4px 4px 0px #0020330A;
                        
                        pointer-events: none;
                        transition: .3s;
                    }

                    .hint-triangle{
                        position: absolute;
                        bottom: calc(100% - 2px);
                        border: 6px solid transparent;
                        border-bottom-color: var(--bg-default);
                        transform: rotate(.5turn) translateY(-100%);
                        margin-top: -12px;
                        pointer-events: none;
                        transition: .3s;
                    }

                    &:not(:hover){
                        .hint, .hint-triangle{
                            @include hidden(10px);
                        }
                    }
                }

                .name{
                    @include text-overflow;
                    color: var(--bg-tone);
                    padding-bottom: 2px;
                    font-size: 16px;
                }

                .type{
                    font-size: 14px;
                    color: var(--typo-secondary);
                }

                .controls{
                    display: flex;
                    margin-right: -8px;
                    height: 100%;
                    overflow: hidden;
                    transition: .3s;
                    flex-shrink: 0;

                    .ico-wr{
                        @include flex-c;
                        height: 100%;
                        width: 22px;
                        flex-shrink: 0;
                        
                        color: var(--bg-tone);
                    }

                    .cas-controls, .checkbox-wr{
                        display: flex;
                        overflow: hidden;
                    }

                    .grip{
                        cursor: grab;

                        &:active{
                            cursor: grabbing;
                        }
                    }
                }

                &:not(:hover){
                    .cas-controls{
                        width: 0;
                    }
                }
            }

            .drop-container{
                padding-left: 20px;
                height: 0;
                overflow: hidden;
                transition: .3s;
            }
        }
    }
</style>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .navbar{
        @include flex-col;
        border-right: 1px solid var(--bg-border);
        transition: .3s;

        h4{
            font-size: 16px;
            font-weight: 600
        }
        

        .top{
            @include flex-jtf;
            width: 100%;
            padding: 24px;
            gap: 20px;

            .drop-arr{
                @include flex-c;
                height: 27px;
                width: 27px;
                cursor: pointer;
                position: relative;
                flex-shrink: 0;

                .ico{
                    transition: .3s;
                    transform: rotate(.5turn);
                }

                &::before{
                    @include pseudo-absolute;
                    height: 100%;
                    width: 100%;
                    transition: .3s;
                    background: red;
                    z-index: -1;
                    background: var(--bg-ghost);
                    border-radius: 50%;
                }

                &:not(:hover){
                    &::before{
                        opacity: 0;
                    }
                }
            }
        }

        &:not([drop]){
            margin-left: -288px;

            .content{
                opacity: 0;
                pointer-events: none;
            }

            .drop-arr .ico{
                transform: rotate(0);
            }
        }

        &:not([hasNav]){
            margin-left: -363px;
        }

        .content{
            height: 100%;
            @include flex-col;
            transition: .3s;
            min-height: 0;
        }
        

        .projects-drop{
            padding: 0 24px;
            flex-shrink: 0;
        }

        .lists-wr{
            height: 100%;
            padding: 0 9px 0 24px;
            margin-right: 11px;
            margin-top: 2px;
            overflow-y: scroll;
            overflow-x: hidden;

            .list{
                padding-left: 20px;
                overflow: hidden;
                transition: .3s;

                &[fake]{
                    position: absolute;
                    @include hidden(0);
                }
            }
        }

        .btns{
            @include flex-jtf;
            padding: 14px 24px;
            gap: 8px;

            .btn{
                height: 32px;
                font-size: 14px;
            }
        }
        
        &[no-project]{
            @include hidden-hor(-10px);
        }

        .add-to-mining-object-wr{
            display: flex;
            gap: 11px;
            margin-bottom: 40px;

            .btn{
                white-space: nowrap;
                font-size: 14px;
                height: 32px;
                padding: 4px 12px;
                width: max-content;
            }
        }
    }

    
</style>