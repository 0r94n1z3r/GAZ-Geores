<template>
    <div class="file-content">
        <h1>Загрузка значений</h1>
        <div class="uploader" v-if="!colInfo?.data">
            <!-- <h4>Ручной ввод</h4>
            <DataInput class="data-input" :info="content" :type="type" no-modal/> -->

            <h4>Файл</h4>
            <div 
                class="drop-area" 
                @dragover="dragover = true" 
                :dragover="dragover || null"
            >
                <input type="file" ref="inp" accept=".xls, .xlsx, .odf" @dragleave="dragover = false" @change="updateFile">
                <div class="controls">
                    <p>Загрузите файлы простым переносом<br>или по кнопке ниже</p>
                    <VButton grey @click="inp.click()">
                        <IClip/>
                        Загрузить файл
                    </VButton>
                </div>
                <div class="loading-wr" :loading="fileLoading || null">
                    <VLoading/>
                </div>
            </div>
        </div>
        <div class="loaded" v-else>

            <template v-if="colInfo.file">
                <div class="content-block" >
                    <h4>Файл</h4>
                    <div class="file-tags">
                        <div class="tag">
                            {{colInfo.file.name}}
                            <div class="cross" @click="removeData">
                                <ICross class="ico"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-block">
                    <h4>Лист в Excel-Файле</h4>
                    <VSelect 
                        :list="colInfo.file.data" 
                        v-model="colInfo.fileActive.sheet"
                        keyName="sheet_name"
                        class="select"
                    />
                </div>

                <div class="content-block">
                    <h4>Столбец в Excel-Файле</h4>
                    <VSelect 
                        :list="Object.keys(activeSheet?.data || {})" 
                        v-model="colInfo.fileActive.key"
                        class="select"
                    />
                </div>
            </template>

            <div class="content-block new-data" v-else>
                <VButton grey @click="removeData">Загрузить новые значениея</VButton>
                <p>(Существующие значениея будут удалены)</p>
            </div>


            <div class="param-preview">
                <div class="title" v-if="colInfo.file">{{activeKey}}</div>
                <div class="content">
                    <div class="values">
                        <div class="item" v-for="(i,k) in colInfo.data" :key="k">{{i}}</div>
                    </div>
                    <div class="info">
                        <h3>Значения по выбранному диапозону</h3>
                        <div class="vals">
                            <div class="val">Среднее значение: {{round(parseFloat(dataMath.avg), 3, {splitThree: true})}}</div>
                            <div class="val">Количество: {{round(parseFloat(dataMath.len), 3, {splitThree: true})}}</div>
                            <div class="val">Сумма: {{round(parseFloat(dataMath.sum), 3, {splitThree: true})}}</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import IClip from "@/components/icons/IClip.vue";
    import ICross from "@/components/icons/ICross.vue";

    import VSelect from "@/components/ui/VSelect.vue";
    import DataInput from "@/components/modules/GeoRes/Collection/DataInput.vue";

    import { parseExcel } from "@/script/distribution.js";

    import { useDistributionStore } from "@/stores/distribution.js";
    import { useProjectStore } from "@/stores/project.js";

    import { Distribution } from "@/script/distribution.js"

    import { create, all } from 'mathjs';

    import { round } from '@/helpers/number.js';

    const DistrStore = useDistributionStore();

    const props = defineProps({
        info: Object,
        type: String
    })

    const content = computed(()=>useProjectStore().currentLevel?.content);

    const colInfo = computed(()=>content.value.distribution_data?.columns[props.type]);

    const dragover = ref(false);

    const inp = ref();

//file upload
    const err = ref('');

    const fileLoading = ref(false);

    const updateFile = ()=>{
        let fl = inp.value.files[0];
        if(colInfo.value?.fileActive?.sheet)colInfo.value.fileActive.sheet = null;


        fileLoading.value = true;
        err.value = ""

        parseExcel(
            fl, 
            (res)=>{
                colInfo.value.file = fl;
                colInfo.value.file.data = res;                

                if(!colInfo.value.fileActive)colInfo.value.fileActive = {};
                colInfo.value.fileActive.sheet = res[0]; 
                
                inp.value.value = '';
                fileLoading.value = false;

                if(!content.value.input_columns.includes(props.type))content.value.columns.push(props.type);
            },
            (err)=>{
                err.value = err;
                if(inp.value)inp.value.value = '';
                fileLoading.value = false;
            }
        )
    }

    const removeData = ()=>{
        colInfo.value.file = null;
        colInfo.value.data = null;
        Distribution.data.delete(content.value.id, props.type);
        content.value.input_columns = content.value.input_columns.filter(e => e != props.type);
    }

    //data 
        //sheet
            const activeSheet = computed(()=>colInfo.value?.fileActive?.sheet);

            watch(activeSheet, n=>{

                if(colInfo.value?.fileActive)
                    colInfo.value.fileActive.key = n && Object.keys(n.data)[0];
            });

        //key
            const activeKey = computed(()=>colInfo.value?.fileActive?.key);

            watch(activeKey, n=>{
                if(colInfo.value?.file?.data && colInfo.value && n){
                    colInfo.value.data = activeSheet.value.data[n];
                    Distribution.data.set(content.value.id, props.type, colInfo.value.data);
                }
            })

        const math = create(all, {number: 'BigNumber'});

        let dataMath = computed(()=>{
            let dt = colInfo.value?.data;
            if(!dt || !dt.length)return{};

            let sum = dt.reduce((a, b) => math.evaluate(`${a} + ${b}`).toString());
            let avg =  dt.length?math.evaluate(`${sum} / ${dt.length}`):0;

            return {
                len: dt.length,
                sum,
                avg
            }
        }) 

//data exists
    const checkData = ()=>{
        fileLoading.value = true;

        if(!colInfo.value){
            if(!content.value.distribution_data)content.value.distribution_data = {};
            if(!content.value.distribution_data.columns)content.value.distribution_data.columns = {};
            if(!content.value.distribution_data.columns[props.type])content.value.distribution_data.columns[props.type] = {};
        }

        Distribution.data.get(
            content.value.id, 
            props.type, 
            (res)=>{
                colInfo.value.data = res.data;
                fileLoading.value = false;
            },
            ()=>{fileLoading.value = false;}
        )
    }

    defineExpose({checkData});

    watch([activeSheet, activeKey], ()=>{
        if(colInfo.value){
            colInfo.value.params = {};
            colInfo.value.input = [];
        }
        content.value.up_to_date_simulation = false;
    });
</script>

<style lang="scss" scoped>
    

    h1{
        margin-bottom: 16px;
    }

    h4{
        font-size: 14px;
        margin-bottom: 8px;
    }

    .file-content{
        @include flex-col;
    }

    .page-loading-wr{
        width: 100%;
        @include flex-c;
    }

    .uploader{
        position: relative;

        h4{
            color: var(--typo-secondary);
        }

        .data-input{
            margin-bottom: 24px;   
        }

        .drop-area{
            @include flex-c;
            height: calc(90vh - 300px);
            max-height: 325px;
            width: 100%;
            border-radius: 4px;
            border: 2px dashed var(--bg-border);
            transition: .3s;
            position: relative;
            overflow: hidden;

            input{
                height: 200%;
                width: 100%;
                top: -100%;
                left: 0;
                position: absolute;
                pointer-events: none;
            }

            .controls{
                @include flex-col;
                align-items: center;

                p{
                    font-size: 14px;
                    color: var(--typo-secondary);
                    margin-bottom: 12px;
                    text-align: center;
                }

                .btn{
                    font-size: 14px;
                    height: 32px;
                    width: max-content;
                    padding: 0 12px;
                    border-radius: 4px;
                }
            }

            &[dragover]{
                border-color: var(--bg-border-focus);
                background: var(--bg-ghost);

                input{
                    pointer-events: all;
                }

                .controls{
                    pointer-events: none;
                }
            }
        }

        .loading-wr{
            position: absolute;
            height: 100%;
            width: 100%;
            background: #ffffff80;
            backdrop-filter: blur(3px);
            @include flex-c;

            &:not([loading]){
                @include hidden(0);
            }
        }
    }

    .loaded{
        .content-block{
            margin-bottom: 16px;
        }

        .new-data{
            display: flex;
            align-items: center;
            gap: 8px;

            .btn{
                width: max-content;
                padding: 0 14px 1px;
                height: 32px;
            }

            p{
                color: var(--typo-control-ghost);
                font-size: 14px;
            }
        }

        .file-tags{
            display: flex;
            gap: 8px;

            .tag{
                display: flex;
                align-items: center;
                height: 28px;
                background: var(--bg-control-ghost);
                color: var(--typo-control-ghost);
                padding-left: 8px;
                border-radius: 4px;
                font-size: 14px;

                .cross{
                    @include flex-c;
                    width: 24px;
                    height: 100%;

                    .ico{
                        height: 11px;
                        width: 11px;
                        cursor: pointer;
                    }
                }
            }
        }

        .select{
            max-width: 350px;
        }

        .param-preview{
            h3{
                font-size: 16px;
            }

            .title{
                font-weight: 700;
                padding: 0 12px;
                margin-bottom: 16px;
            }

            .content{
                display: flex;
                gap: 44px;

                .values{
                    overflow-y: auto;
                    overflow-x: hidden;
                    max-height: calc(90vh - 540px);

                    .item{
                        border: 1px solid var(--bg-border);
                        background: var(--bg-ghost);
                        padding: 8px 12px;
                        width: 273px;
                        
                        &:not(:first-child){
                            border-top: 0;
                        }
                    }
                }

                .info{
                    h3{
                        margin-bottom: 16px;
                    }

                    .vals{
                        font-size: 14px;
                    }
                }
            }
        }
    }


</style>