<template>
    <div class="page" v-if="proj.activeProjectDisplay">
        <div class="title" v-if="route.meta.staticTitle">
            <h1>{{route.meta.staticTitle}}</h1>
        </div>
        <div v-else class="title" :title-edit="titleIsEdit || null">
            <h1 v-show="!titleIsEdit">{{info?.name}}</h1>
            <VTextInput 
                class="title-input" 

                v-show="titleIsEdit" 
                v-model="tmpTitle" 

                @keydown.enter="editHandler" 
                
                dynamic
                ref="titleInput"
            />
            <div class="ico-btn edit" @click="editHandler">
                <IPencil v-if="!titleIsEdit" class="ico"/>
                <ITick v-else class="ico"/>
            </div>
            <div 
                class="ico-btn delete" 
                @click="del.call(info, deleteHandler)"
                v-if="level != 'Project'"
            >
                <ITrash class="ico"/>
            </div>
        </div>

        <!-- <PageNavigation
            :list="pageNavListDisplay"
            class="nav"
        /> -->

        <slot/>
    </div>
    <div class="page noproject" v-else>
        <div class="loading-wr" v-if="proj.projectsLoading">
            <VLoading class="loading" />
        </div>
        <div class="title" v-else>
            <h1>Нет проектов</h1>
            <VButton @click="proj.newProject()">Создать проект</VButton>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watch } from "vue";

    import IPencil from "@/components/icons/IPencil.vue";
    import ITick from "@/components/icons/ITick.vue";
    import ITrash from "@/components/icons/ITrash.vue";

    import { useProjectStore } from "@/stores/project.js";
    import { useDeleteAlertStore } from "@/stores/deleteAlert.js";
    import MiningStore from "@/stores/mining.js";
    import RouterControl from "@/stores/routerControl.js";

    import { useRoute, useRouter } from 'vue-router';

    import PageNavigation from "@/components/page/PageNavigation.vue";

    const route = useRoute();
    const router = useRouter();

    const proj = useProjectStore();
    const del = useDeleteAlertStore();
    const Mining = MiningStore();
    const R = RouterControl();

    const info = computed(()=>route.meta?.groups?Mining.currentLevel.content:proj.currentLevel.content);
    const level = computed(()=>route.meta?.groups?Mining.currentLevel.level:proj.currentLevel.level);

//title edit
    const titleIsEdit = ref(false);
    const tmpTitle = ref('');
    const titleInput = ref(null);

    watch(()=>info.value?.id, ()=>{
        titleIsEdit.value = false;
    })

    const editHandler = ()=>{
        if(level.value == 'Project'){
            router.push({name: 'Edit', params: {projId: proj.activeProject?.id}});
            return;
        }

        if(titleIsEdit.value == true){
            if(!tmpTitle.value){
                tmpTitle.value = info.value.name;
            }else{
                if(route.meta?.mining)Mining.editMiningItem(info.value, level.value, {name: tmpTitle.value})
                else proj.editProjectItem(info.value, level.value, {name: tmpTitle.value});
            }    
        }else{
            titleInput.value.focus();
            tmpTitle.value = info.value.name;
        }

        titleIsEdit.value = !titleIsEdit.value;
    };

//title delete
    const deleteHandler = ()=>{
        if(route.meta?.mining){
            Mining.deleteMiningItem(info.value, level.value, levelList.value)
        }else{
            proj.deleteProjectItem(info.value, level.value, levelList.value)
        }
    }

    const levelList = computed(()=>{
        switch(level.value){
            case 'Project':
                return proj.projects;
            case 'Sensor':
                return proj.sensors;
            case 'Layer':
                return proj.activeSensor?.layers;
            case 'Group':
                return Mining.groups;
            case 'Object':
                return Mining.objects;
        }
    });

//navList
    const pageNavList = ref([
        {
            title: 'Вероятностная оценка запасов',
            mode: 'GeoRes',
        },
        {
            title: 'Расчёт профилей добычи',
            mode: 'MiningCalc',
        },
        {
            title: 'Обустройство месторождения',
            mode: '',
            disabled: true,
        },
        {
            title: 'Оценка экономической эффективности',
            mode: '',
            disabled: true,
        },
    ]);

    const pageNavListDisplay = computed(()=>pageNavList.value.map(e => {
        return {
            title: e.title,
            click: ()=>R.setMode(e.mode),
            active: ()=>route?.name && route.name.split('_')[0] == e.mode,
            disabled: e.disabled
        }
    }));

</script>

<style lang="scss" scoped>
    

    .page{
        padding: 24px;
        padding-bottom: 0;
        height: 100%;
        @include flex-col;
    }

    .title{
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        word-break: break-word;

        .ico-btn{
            @include flex-c;

            width: 24px;
            height: 24px;
            color: var(--typo-secondary);
            background: var(--bg-secondary);
            cursor: pointer;
            border-radius: 4px;
            flex-shrink: 0;

            .ico{
                height: 65%;
            }
        }

        .title-input{
            :deep(.content){
                height: 40px;
                font-size: 20px;

                input{
                    font-size: 20px;
                }
            }
        }

        &[title-edit]{
            margin-top: -8px;
            margin-left: -10px;
            margin-bottom: 16px;
            align-items: center;

            .ico-btn{
                transform: none;
            }
        }
    }

    .nav{
        margin-bottom: 24px;
    }

    .noproject{
        .title{
            align-items: baseline;
            
            h1{
                white-space: nowrap;
            }

            .btn{
                width: max-content;
                padding: 0 14px 1px;
                font-size: 16px;
                height: 32px;
            }
        }

        .loading-wr{
            height: 100%;
            width: 100%;

            @include flex-c;
            padding-right: 363px;
        }
    }
</style>