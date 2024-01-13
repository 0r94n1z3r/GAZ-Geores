<template>
    <div class="edit-page">
        <div class="title">
            <h1>{{`${props.projId?'Редактирование':'Создание'} проекта`}}</h1>
        </div>

        <div class="content-block upload" v-if="!props.projId && !file">
            <input type="file" ref="fileInp" accept=".json" @change="uploadHandler">
            <VButton hollow @click="fileInp.click()">Загрузить</VButton>
        </div>

        <div class="file" v-if="file">
            <div class="file-title">
                {{info.name}}
            </div>

            <div class="cross" @click="info = {}; file = null;">
                <ICross class="ico"/>
            </div>
        </div>

        <template v-else>
            <div class="content-block">
                <h3>Название лицензионного участка (месторождения):</h3>
                <VTextInput
                    placeholder="Введите название... "
                    v-model="info.name"

                    @focus="titleErr = ''"
                    @blur="()=>{if(!info.name)titleErr = 'Заполните поле'}"
                    :err="titleErr"
                />
            </div>

            <div class="content-block">
                <h3>Краткое описание проекта:</h3>
                <VTextarea 
                    class="description"
                    rows="5"
                    placeholder="Введите описание..."
                    v-model="info.description"
                />
            </div>
            <!-- 
            <div class="content-block">
                <h3>Автор проекта:</h3>
                <VTextInput
                    placeholder="Введите автора... "
                    v-model="info.author"
                />
            </div> 
            -->

            <h1 class="header">Структура проекта</h1>

            <div class="structure content-block">
                <ProjStructureList 
                    :list="info.sensors"
                    :isEdit="isEdit"
                    title="Название пласта"
                />
                <div class="navbar-item add-btn" @click="addSensor">
                    <div class="item-content">
                        <div class="container">
                            <div class="ico-wr"><IPlus class="ico"/></div>
                            <div class="name">Добавить пласт</div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        

        <div class="server-error" :v-if="err">{{err}}</div>
        
        <div class=" btns">
            <VButton :loading="saveLoading || null" @click="save">Сохранить</VButton>
            <VButton v-if="isEdit" :loading="saveLoading || null" hollow red @click="del.call(proj.activeProject, ()=>proj.deleteProjectItem(proj.activeProject, 'Project', proj.projects))">Удалить</VButton>
            <VButton v-if="proj.projects.length" :loading="saveLoading || null" hollow @click="cancel">Отмена</VButton>
        </div>

    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import IPlus from '@/components/icons/IPlus.vue';
    import ICross from '@/components/icons/ICross.vue';

    import VTextarea from "@/components/ui/VTextarea.vue";
    import ProjStructureList from "@/components/modules/EditProj/ProjStructureList.vue";

    import { useProjectStore } from "@/stores/project.js";
    import { useDeleteAlertStore } from "@/stores/deleteAlert.js";

    import { useRouter } from "vue-router";

    import { readJSON } from "@/helpers/file.js";
    
    const props = defineProps({
        projId: String
    });

    const proj = useProjectStore();
    const del = useDeleteAlertStore();

    const router = useRouter();

    const info = ref({});

    const isEdit = computed(()=>!!props.projId);

    const updateInfo = ()=>{
        info.value = isEdit.value?
            JSON.parse(JSON.stringify(proj.activeProject))
        :{
            name: "",
            description: "",
            sensors: [
                {
                    name: "",
                    loading: true,
                    layers: [
                        {
                            name: "",
                            fluid_type: "empty",
                            loading: true
                        }
                    ]
                }
            ]
        }
    }

    onMounted(updateInfo);
    watch(()=>props.projId, updateInfo);
    watch(()=>proj.activeProject.id, updateInfo);

    const addSensor = ()=>{
        info.value.sensors.push({
            name: "",
            layers: [],
            loading: true
        });
    }

//btns
    const saveLoading = ref(false);
    const err = ref('');
    const titleErr = ref('');

    const save = ()=>{
        saveLoading.value = true;
        err.value = '';

        if(!info.value.name){
            saveLoading.value = false;
            return;
        }

        if(file.value){
            proj.uploadProject(
                null, 
                null, 
                (res)=>{
                    saveLoading.value = false;
                    err.value = res;
                },
                file.value
            );

            return;
        }

        let toSend = JSON.parse(JSON.stringify(info.value));

        toSend.sensors.forEach(s => {
            if(!s.name)s.name = "Новый пласт";
            s.layers.forEach(l => {if(!l.name)l.name = "Новая залежь"});
        });

        console.log(toSend);

        proj.uploadProject(
            toSend, 
            isEdit.value, 
            (res)=>{
                saveLoading.value = false;
                err.value = res;
            }
        );
    }

    const cancel = ()=>{
        if(router.options.history.state.back){
            router.back();
        }else{
            router.push('/');
        }
    }   

//import
    const fileInp = ref();
    const fileErr = ref('');

    const file = ref();

    const uploadHandler = ()=>{
        fileErr.value = '';
        readJSON(fileInp.value.files[0], (res)=>{
            file.value = fileInp.value.files[0];

            fileInp.value.value = '';

            if(!res?.project){
                fileErr.value = "Проект не найден";
                return;
            }

            info.value = res?.project;
        })
    }

</script>

<style lang="scss" scoped>
    

    .edit-page{
        padding: 24px 19px;
    }

    .title{
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        word-break: break-word;
    }

    h3{
        font-size: 16px;
        color: var(--typo-secondary);
        margin-bottom: 8px;
    }

    .content-block{
        margin-bottom: 24px;
        width: 100%;
        max-width: 450px;

        textarea.desciption{
            height: 100px;
        }

        .input{
            font-size: 16px;
        }
    }

    .upload{
        input{
            position: absolute;
            @include hidden(0);
        }

        .btn{
            height: 30px;
            width: max-content;
            padding: 0 30px 1px;
        }
    }

    .header{
        margin-bottom: 15px;
    }

    .navbar-item{
        width: 450px;
        

        .item-content{
            width: 100%;
            
            .container{
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                width: 100%;
            }
        }

        &.add-btn{
            cursor: pointer;
            margin-top: 8px;
            padding-left: 30px;

            .item-content, .container .name{
                color: var(--typo-brand)
            }

            .ico-wr{
                height: 32px;
                width: 32px;
                margin: 0 -8px;
                @include flex-c;
                flex-shrink: 0;

                .ico{
                    height: 12px;
                    width: 12px;
                    color: var(--typo-brand);
                    margin-bottom: -3px;
                }
            }
        }
    }

    .btns{
        display: flex;
        gap: 8px;

        .btn{
            width: max-content;
            padding: 0 18px 1px;
            height: 32px;
            font-size: 14px;
        }
    }

    .server-error{
        color: var(--typo-alert);
        margin-bottom: 24px;
    }

    .file{
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 4px;
        color: var(--typo-control-ghost);
        background: var(--bg-ghost);
        width: max-content;
        border-radius: 4px;
        padding: 2px 1px;

        .file-title{
            @include text-overflow;
            padding-left: 9px;
            font-size: 18px;
        }

        .cross{
            width: 22px;
            height: 22px;

            @include flex-c;
            border-radius: 50%;
            cursor: pointer;
            transition: .3s;

            &:hover{
                background: var(--bg-ghost);
            }
            
            .ico{
                height: 100%;
                width: 50%;
            }
        }
    }

    
</style>