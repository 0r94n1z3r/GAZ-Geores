<template>
    <LayFooterPage reversed :hideFooter="Mining.activeGroup.up_to_date_calculation">
        <h1>2.{{id=='p90'?1:id=='p50'?2:3}}. Геологический сценарий</h1>
        <p class="comment">Для каждого из геологических сценариев пользователь может задавать значения параметров разработки по&nbsp;одному или трем сценариям разработки: P<span class="sub">90</span>, P<span class="sub">50</span>, P<span class="sub">10</span></p>
        
        <div class="loading-wr" v-if="data == null"><VLoading/></div>
        <template v-else>
            <div class="content-block">
                <div class="title">
                    <h1>Исходные данные</h1>
                    <VButton grey class="action-btn" @click="emit('backToBasic')"><ISettings class="ico"/></VButton>
                </div>
                
                <div class="basic-data-drop-wr">
                    <div class="drop-caller" @click="basicDataDrop = !basicDataDrop" :drop="basicDataDrop || null"><IDropArr class="ico"/></div>
                    <div class="data-inputs basic-data-drop" :style="{height: basicDataDropHeight}">
                        <div class="m-data-input">
                            <div class="title-wr">
                                <p>Геологические сценарии</p>
                            </div>
                            <div class="inputs">
                                <div class="inp-wr"><div class="locked"><span>P<span class="sub">{{id.slice(1)}}</span></span></div></div>
                            </div>
                        </div>
                        <MDataInput 
                            v-for="(i,k) in data.moved_calculated_data" 
                            :key="k"
                            :showPercs="[id]"
                            :title="`${i.verbose_name}, ${i.units}`"
                            locked
                            :value="i.value"
                        />
                        <MDataInput 
                            v-for="(i,k) in data.moved_input_data" 
                            :key="k"
                            :showPercs="[id]"
                            :title="`${i.verbose_name}, ${i.units}`"
                            locked
                            :value="i.value"
                        />
                    </div>
                    <div class="data-inputs basic-data-drop" ref="basicDataDropFake" fake>
                        <div class="m-data-input">
                            <div class="title-wr">
                                <p>Геологические сценарии</p>
                            </div>
                            <div class="inputs">
                                <div class="inp-wr"><div class="locked"><span>P<span class="sub">{{id.slice(1)}}</span></span></div></div>
                            </div>
                        </div>         
                        <MDataInput 
                            v-for="(i,k) in data.moved_calculated_data" 
                            :key="k"
                            :showPercs="[id]"
                            :title="`${i.verbose_name}, ${i.units}`"
                            locked
                            :value="i.value"

                            :borders="getBorders(
                                i.minval_closed,
                                i.minval,
                                i.maxval,
                                i.maxval_closed
                            )"
                        />
                        <MDataInput 
                            v-for="(i,k) in data.moved_input_data" 
                            :key="k"
                            :showPercs="[id]"
                            :title="`${i.verbose_name}, ${i.units}`"
                            locked
                            :value="i.value"

                            :borders="getBorders(
                                i.minval_closed,
                                i.minval,
                                i.maxval,
                                i.maxval_closed
                            )"
                        />
                    </div>
                </div>
            </div>

            <div class="content-block">
                <div class="title">
                    <h1>Ввод значений для параметров разработки</h1>
                </div>

                <div class="m-data-input">
                    <div class="title-wr">
                        <p>* Вставка значений из другого геол. сценария</p>
                    </div>
                    <div class="inputs">
                        <TextSelect v-model="sceneToImport" :list="scenesToImport" keyName="name" :err="importError"/>
                    </div>
                    <VButton grey class="action-btn" @click="importScene" :disabled="!sceneToImport || null" :loading="importLoading || null"><IUpload class="ico"/></VButton>
                </div>
            </div>

            <div class="content-block" v-for="(fs,f) in Mining.defaultValues.object_calculation_input_fieldsets" :key="f">
                <h1>{{fs.verbose_name}}</h1>
                <template v-for="(col,k) in fs.columns">
                    <MSwitchInput
                        v-if="data.input_data?.[id]?.[col]?.boolean"
                        :reversed="['14.33'].includes(col)"
                        :key="'i'+col"
                        :title="`${data.input_data?.[id]?.[col]?.verbose_name}${data.input_data?.[id]?.[col]?.units && `, ${data.input_data?.[id]?.[col]?.units}`}`"
                        :value="data.input_data?.[id]?.[col]?.value"
                        :error="data.input_data?.[id]?.[col]?.err"
                        @update="(e)=>{upload(col, e)}"

                        :loading="data.input_data?.[id]?.[col]?.loading"
                    />
                    <MDataYearInput 
                        v-else-if="data.input_data?.[id]?.[col]?.array"
                        :key="k"
                        :title="`${data.input_data?.[id]?.[col]?.verbose_name}${data.input_data?.[id]?.[col]?.units && `, ${data.input_data?.[id]?.[col]?.units}`}`"
                        :value="data.input_data?.[id]?.[col]?.value"

                        :error="data.input_data?.[id]?.[col]?.err"
                        @update="(e)=>{upload(col, e)}"

                        :borders="getBorders(
                            data.input_data?.[id]?.[col]?.minval_closed,
                            data.input_data?.[id]?.[col]?.minval,
                            data.input_data?.[id]?.[col]?.maxval,
                            data.input_data?.[id]?.[col]?.maxval_closed
                        )"

                        :loading="data.input_data?.[id]?.[col]?.loading"
                    />
                    <MDataInput 
                        v-else
                        :key="col"
                        :showPercs="[id]"
                        :title="`${data.input_data?.[id]?.[col]?.verbose_name}${data.input_data?.[id]?.[col]?.units && `, ${data.input_data?.[id]?.[col]?.units}`}`"
                        :value="data.input_data?.[id]?.[col]?.value"

                        :error="data.input_data?.[id]?.[col]?.err"
                        @update="(e)=>{upload(col, e)}"

                        shrinkable
                        shrinkableRev

                        :borders="getBorders(
                            data.input_data?.[id]?.[col]?.minval_closed,
                            data.input_data?.[id]?.[col]?.minval,
                            data.input_data?.[id]?.[col]?.maxval,
                            data.input_data?.[id]?.[col]?.maxval_closed
                        )"

                        :loading="data.input_data?.[id]?.[col]?.loading"
                    />
                </template>
            </div>
        </template>

        <template #footer>
            <MCalculationFooter/>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import { getBorders } from "@/helpers/borders.js";

    import IPlus from "@/components/icons/IPlus.vue";
    import IMinus from "@/components/icons/IMinus.vue";
    import ISettings from "@/components/icons/ISettings.vue";
    import IDropArr from "@/components/icons/IDropArr.vue";
    import IUpload from "@/components/icons/IUpload.vue";
    
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import MDataInput from "@/components/modules/MiningCalc/MData/ui/MDataInput.vue"
    import MDataYearInput from "@/components/modules/MiningCalc/MData/ui/MDataYearInput.vue"
    import MCalculationFooter from "@/components/modules/MiningCalc/MData/ui/MCalculationFooter.vue"
    import MSwitchInput from "@/components/modules/MiningCalc/MData/ui/MSwitchInput.vue"

    import MiningStore from "@/stores/mining.js";
    import mAPI from "@/script/mining.js";

    import TextSelect from "@/components/ui/TextSelect.vue";

    import { useProjectStore } from "@/stores/project.js";
    
    import { useRoute } from "vue-router";
    import { compare } from "mathjs";

    const props = defineProps({
        id: [String, Number],
        data: Object
    });
    
    const route = useRoute();

    const Mining = MiningStore();

    const emit = defineEmits(['backToBasic']);

//basicDataDrop
    const basicDataDrop = ref(false);
    const basicDataDropHeight = ref('32px');
    const basicDataDropFake = ref();

    watch(basicDataDrop, n=>{
        basicDataDropHeight.value = basicDataDropFake.value.clientHeight+'px';
        if(n){            
            setTimeout(()=>basicDataDropHeight.value = 'auto', 300)
        }else{
            setTimeout(()=>basicDataDropHeight.value = '32px')
        }
    })

//upload
    const upload = (col, dataToSend)=>{
        // Mining.activeGroup.up_to_date_calculation = false; 
        props.data.input_data[props.id][col].err = '';
        props.data.input_data[props.id][col].loading = true;

        // console.log(dataToSend);

        let toSend = {
            [`${props.id}p10`]: dataToSend.p10 || 0,
            [`${props.id}p50`]: dataToSend.p50 || 0,
            [`${props.id}p90`]: dataToSend.p90 || 0,
        }

        mAPI.object().data.set(
            route.params.objectId,
            col,
            'calculation_input',
            toSend,
            res=>{
                console.log(res);
                Mining.refreshStatus(route.params.groupId);
                props.data.input_data[props.id][col].loading = false;
            }, 
            err=>{
                console.log(err);
                props.data.input_data[props.id][col].err = Object.entries(Object.entries(err)?.[0]?.[1] || {})?.[0] || err
                props.data.input_data[props.id][col].loading = false;
            }
        )
    }

//importScene
    const sceneToImport = ref(null);

    const scenesToImport = computed(()=>
        Mining.allObjects.map(e => 
            [
                Object.assign({perc: 'p10'}, JSON.parse(JSON.stringify(e)), {name: `${e.name} (P10)`}),
                Object.assign({perc: 'p50'}, JSON.parse(JSON.stringify(e)), {name: `${e.name} (P50)`}),
                Object.assign({perc: 'p90'}, JSON.parse(JSON.stringify(e)), {name: `${e.name} (P90)`}),
            ]
        ).flat().filter(e => e.id != Mining.activeObject?.id || props.id != e.perc)
    );

    const importLoading = ref(false);
    const importError = ref('');

    const importScene = ()=>{
        importLoading.value = true;
        importError.value = '';

        mAPI.object().data.copy(
            Mining.activeObject?.id,
            sceneToImport.value.id,
            props.id,
            sceneToImport.value.perc,
            res => {
                let objs = parseMiningInputData(res);
                props.data.input_data[props.id] = objs[props.id];

                Mining.refreshStatus(route.params.groupId);

                importLoading.value = false;
            },
            err => {
                importError.value = err;
                importLoading.value = false;
            }
        )
    }

    const parseMiningData = (
        resp,
        respKey,
        defaultKey
    )=>{
        let arr = JSON.parse(JSON.stringify(Mining.defaultValues[defaultKey]));

        Object.keys(arr).forEach(key => {
            let val = resp[respKey]?.data?.[key];

            arr[key].value = 
                val ?( 
                    arr[key].array?
                        {
                            p10:  val?.p10 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p10:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p50:  val?.p50 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p50:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p90:  val?.p90 || (typeof val == 'object' && recalculateArray((val.length == null?val?.p90:val) || [])) || new Array(useProjectStore().activeProject?.mining_n_years || 0)
                        }:
                        {
                            p10: val?.p10?.[0], 
                            p50: val?.p50?.[0], 
                            p90: val?.p90?.[0]
                        }
                ):
                (
                    arr[key].array?
                        {
                            p10: new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p50: new Array(useProjectStore().activeProject?.mining_n_years || 0), 
                            p90: new Array(useProjectStore().activeProject?.mining_n_years || 0)
                        }:
                        {p10: null, p50: null, p90: null}
                )
        });

        return arr;
    }

    const recalculateArray = (arr)=>{
        let y = useProjectStore().activeProject?.mining_n_years;
        return Object.assign(new Array(y).fill(arr[0]), arr.slice(0, y));
    }

    const parseMiningInputData = (resp)=>{
        ['p10', 'p50', 'p90'].forEach(perc => {
            resp[`input_data_${perc}`] = {data: {}};

            Object.keys(resp.input_data?.data || {}).forEach(key => {
                resp[`input_data_${perc}`].data[key] = {p10: null, p50: null, p90: null};
                ['p10', 'p50', 'p90'].forEach(perc2 => {
                    resp[`input_data_${perc}`].data[key][perc2] = resp[`input_data`].data[key][`${perc}${perc2}`]
                })
            });
        })

        return {
            p10: parseMiningData(resp, 'input_data_p10', 'object_calculation_input'),
            p50: parseMiningData(resp, 'input_data_p50', 'object_calculation_input'),
            p90: parseMiningData(resp, 'input_data_p90', 'object_calculation_input'),
        }
    }

</script>

<style lang="scss" scoped>
    h1{
        margin-bottom: 7px;
    }

    .comment{
        color: var(--typo-secondary);
        font-size: 12px;
        max-width:  700px;
        margin-bottom: 27px;
    }

    .data-inputs{
        @include flex-col;
        gap: 20px;
    }

    .m-data-input{
        .action-btn.btn{
            height: 32px;
            width: 32px;
            flex-shrink: 0;
            color: var(--typo-secondary);
        }
    }

    .content-block{
        margin-bottom: 27px;
        padding-left: 32px;
        @include flex-col;
        gap: 6px;

        .title{
            margin-left: -32px;
            display: flex;
            gap: 10px;
            color: var(--typo-secondary);
        }
    }

    .action-btn.btn{
        height: 24px;
        width: 24px;
        @include flex-c;
        border-radius: 4px;
    }

    .basic-data-drop-wr{
        position: relative;
        
        .basic-data-drop{
            transition: .3s;
            overflow: hidden;

            &[fake]{
                @include hidden(0);
                position: absolute;
                bottom: 0;
            }
        }

        .drop-caller{
            position: absolute;
            height: 32px;
            width: 32px;
            left: -40px;
            top: 0;
            @include flex-c;
            cursor: pointer;
            transition: .3s;
            &[drop]{
                transform: rotate(.5turn);
            }
        }
    }    
</style>
