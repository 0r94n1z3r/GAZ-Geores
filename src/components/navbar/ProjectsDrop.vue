<template>
    <div class="projects-drop" v-click-outside="blurHandler" :drop="drop || null">
        <div class="top">
            <div class="projs">
                <div class="title">
                    <input type="text" v-model="text" @focus="focusHandler" @keydown.enter="enterHandler" ref="inp">
                    <div class="ico-wr" @click="drop?blurHandler():inp.focus()">
                        <IDrop class="ico"/>
                    </div>
                </div>
                <div class="drop-container" >
                    <div class="option" v-for="(i,k) in projectsDisplay" :key="k" @click="clickHandler(i)">{{i.name}}</div>
                </div>
            </div>

            <div class="call-search" @click="() => {searchDrop = !searchDrop; if(!searchDrop)searchText = ''}">
                <ISearch class="ico"/>
            </div>
        </div>

        <div class="search-drop" :s-drop="searchDrop || null">
            <div class="title">
                <input type="text" placeholder="Введите пласт или залежь" v-model="searchText">
                <div class="ico-wr" :show="searchText || null" @click="searchText = ''">
                    <ICross class="ico"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import IDrop from "@/components/icons/IDrop.vue";
    import ISearch from "@/components/icons/ISearch.vue";
    import ICross from "@/components/icons/ICross.vue";

    import { useRoute } from "vue-router";

    import { useProjectStore } from "@/stores/project.js";

    const emit = defineEmits(['search']);

    const proj = useProjectStore();

    const drop = ref(false);

    const inp = ref();

    const route = useRoute();

    const text = ref(proj.activeProject?.name);
    const backUpText = ref(text.value);

    const isOld = computed(()=>text.value == backUpText.value);

    const projectsDisplay = computed(()=>{
        if(isOld.value){
            return proj.projects;
        }else{
            return proj.projects.filter(e => strIncludes(e.name, text.value));
        }
    })

    const blurHandler = ()=>{
        if(!drop.value)return;
        drop.value = false;

        if(isOld.value)return;
        
        let obj = null;

        if(projectsDisplay.value.some(e => {
            if(strIncludes(e.name, text.value)){
                obj = e;
                return true;
            }
            return false;
        })){
            text.value = obj.name;
            backUpText.value = obj.name;
            proj.setActiveProjectId(obj.id);
        }else{
            text.value = backUpText.value;
        }
    }

    const focusHandler = ()=>{
        drop.value = true;
        
        if(!route.meta?.extra?.noProjectPage){
            proj.setActiveProjectId(proj.activeProjectId);
        }
        
        backUpText.value = text.value;
    }

    const enterHandler = ()=>{
        inp.value.blur();
        if(!isOld.value)text.value = projectsDisplay.value[0].name || "";
        blurHandler();
    }

    const clickHandler = (obj)=>{
        text.value = obj.name;
        backUpText.value = obj.name;
        proj.setActiveProjectId(obj.id);
        drop.value = false;
    }

    watch(()=>proj.activeProject.name, (newName)=>{
        if(newName != text.value){
            text.value = newName;
            backUpText.value = newName;
        }
    });

    
//search
    const searchDrop = ref(false);
    const searchText = ref('');
    watch(searchText, n => emit('search', n));

const strIncludes = (str1, str2)=>{
    return str1.toLowerCase().includes(str2.toLowerCase());
}

</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .projects-drop{
        position: relative;
        width: 100%;
        @include flex-col;
        gap: 10px;

        .top{
            display: flex;

            .projs{
                display: flex;
                position: relative;
                width: 100%;
            }

            .call-search{
                width: 48px;
                height: 48px;
                @include flex-c;
                cursor: pointer;
            }
        }

        .title{
            height: 48px;
            width: 100%;
            border: 1px solid var(--bg-border);
            border-radius: 4px;
            @include flex-jtf;

            input{
                border: none;
                width: 100%;
                border-radius: 3px;
                padding: 0 12px;
            }

            .ico-wr{
                width: 48px;
                height: 48px;
                @include flex-c;
                flex-shrink: 0;
                cursor: pointer;

                color: var(--typo-secondary);

                .ico{
                    height: 10px;
                    width: 10px;
                    transition: .3s;
                }
            }
        }

        .drop-container{
            position: absolute;
            top: 100%;
            padding: 2px 0;
            background: var(--bg-default);
            width: 100%;
            z-index: 1;
            transition: .3s;

            border-radius: .4px;

            box-shadow: 0px 8px 24px 0px #0020331F;
            box-shadow: 0px 4px 4px 0px #0020330A;

            .option{
                background: var(--bg-default);
                padding: 2px 13px;
                cursor: pointer;
                transition: .3s;

                &:hover{
                    background: var(--bg-stripe);
                }
            }
        }

        &:not([drop]){
            .drop-container{
                @include hidden(-10px);
            }
        }
        
        &[drop]{
            .ico-wr .ico{
                transform: rotate(.5turn);
            }
        }

        .search-drop{
            height: 48px;
            transition: .3s;
            overflow: hidden;

            &:not([s-drop]){
                height: 0;
                margin-top: -10px;
                @include hidden(0px);
            }

            .ico-wr{
                transition: .3s;

                &:not([show]){
                    @include hidden-hor(10px);
                }
            }
        }

        .search-drop .ico-wr, .call-search{
            color: var(--bg-border-focus);
            position: relative;

            &::before{
                @include pseudo-absolute;
                height: 35px;
                width: 35px;
                @include all-directions(0);
                margin: auto;
                border-radius: 50%;
                transition: .3s;
                background: var(--bg-ghost);
            }

            &:not(:hover){
                &::before{
                    opacity: 0;
                }
            }

            &:active{
                &::before{
                    transition: 0;
                    background: var(--bg-border);
                }
            }
        }

        .search-drop .ico-wr::before{
            height: 20px;
            width: 20px;
        }
    }
</style>