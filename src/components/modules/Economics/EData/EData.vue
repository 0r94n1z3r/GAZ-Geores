<template>
    <LayFooterPage reversed :hideFooter="!model">

        <div class="add-model-btn-wr" v-if="!model">
            <VButton @click="addModel">
                Добавить экономическую модель
            </VButton>
        </div>

        <VLoading v-else-if="model.loading"/>

        <template v-else>
            <div class="content">
                <h1>Исходные данные</h1>
                <p class="comment">В данном разделе заполняются общие для каждого из кейсов значения параметров</p>

                <p v-if="err" err>{{err}}</p>

                <div class="scene-wr">
                    <h1>Определение периода расчета</h1>
                    <div class="inp-wr">
                        <div class="title">Год начала расчета</div>
                        <VTextInput v-model="model.economic_start_year" borders="[1;]" blurOnly/>
                    </div>
                    <div class="inp-wr">
                        <div class="title">Период расчета, лет</div>
                        <VTextInput v-model="model.economic_n_years" borders="[1;]" blurOnly/>
                    </div>
                </div>
                

                <div class="scene-wr" v-for="(i,k) in model?.data" :key="k">
                    <h1>{{i?.verbose_name}}</h1>
                    <EcoInput v-for="(c,ck) in i.columns" :key="ck" :info="c" :colname="ck" :model="model"/>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="footer-container">
                <p err class="calc-err" v-if="calcErr">{{calcErr}}</p>
                <VButton
                    :disabled="!model?.has_all_data || null"
                    @click="calculate"
                    :loading="calcLoading || null"
                >
                    Выполнить оценку
                </VButton>   
            </div>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";
    import MRScenes from "@/components/modules/MiningCalc/MResults/ui/MRScenes.vue";

    import EcoInput from "@/components/modules/Economics/ui/EcoInput.vue";

    import Eco from "@/stores/economics.js";
    import eAPI from "@/script/economics.js"

    import R from "@/stores/routerControl.js"

    import { computed, onMounted, ref, watch } from "vue";

    const model = computed(()=>Eco().activeModel); 

    const err = ref(null);

    //update
        const update = ()=>{
            Eco().updateModelByGroup(
                Eco().activeGroupId,
                (error)=>err.value=error
            );
        }

        onMounted(update);
        watch(()=>[Eco().activeGroupId, R().route?.meta?.mode], update);

    //add
        const addModel = ()=>{
            Eco().addModel(
                Eco().activeGroupId,
                (error)=>err.value=error
            );
        }

    //scene
        const sceneWr = ref([]);
        const scene = computed(()=>sceneWr.value[0]);
        const selectedScene = ref(null); 

    //calculate
        const calcLoading = ref();
        const calcErr = ref();

        const calculate = ()=>{
            calcLoading.value = true;
            calcErr.value = false;
            model.value.up_to_date_calculation = false;
            
            eAPI.model.calculate(
                model.value?.id,
                res => {
                    model.value.up_to_date_calculation = true;
                    Eco().setType(1);
                    calcLoading.value = false;
                }, 
                error => {
                    calcErr.value = error;
                    calcLoading.value = false;
                }
            );
        }

        const isCalculated = (sceneToCheck)=>{
            if(!sceneToCheck)return false;
            
            let pp = pString(sceneToCheck);

            return model.value.calculated_percentiles.includes(pp);
        }
    
    //date
        // watch(()=>model[`economic_start_year`], n=>{mStruct.Project.edit(Proj.activeProject.id, {[`${props.yearKey}_start_year`]: n})});
        // watch(()=>model[`economic_n_years`], n=>{mStruct.Project.edit(Proj.activeProject.id, {[`${props.yearKey}_n_years`]: n})});

        watch(()=>model.value?.[`economic_start_year`], n=>{if(typeof n == "string")Eco().editModel(model.value.id, {economic_start_year: n})});
        watch(()=>model.value?.[`economic_n_years`], n=>{
            if(typeof n == "string"){
                n = parseInt(n);
                Eco().editModel(model.value.id, {economic_n_years: n});

                setTimeout(()=>
                    model.value.data.forEach(e => 
                        Object.keys(e.columns).forEach(c => {
                            console.log(c, e.columns[c])

                            if(e.columns[c].array){
                                e.columns[c].value = new Array(n).fill(0);

                                eAPI.model.data.set.input(
                                    Eco().activeModel?.id,
                                    c,
                                    e.columns[c].value,
                                    (res) => {
                                        Eco().activeModel.has_all_data = false;
                                    },
                                    ()=>{}
                                )
                            }
                        })
                    )
                , 1000);
                
            }
        });
</script>

<style lang="scss" scoped>
    .add-model-btn-wr{
        .btn{
            padding: 20px;
            width: max-content;
        }
    }

    .content{
        h1{
            margin-bottom: 10px;
        }

        .comment{
            color: var(--typo-secondary);
            font-size: 12px;
            max-width: 700px;
        }

        .scene-picker{
            display: flex;
            gap: 20px;
            
            .btn{
                height: 32px;   
                padding: 0 20px;
                font-size: 14px;
            }

            p{
                color: var(--typo-control-ghost);
                font-size: 14px;
                align-self: center;
            }
        }

        .scene-wr{
            @include flex-col;
            padding: 20px 0;
            gap: 10px;
        }
    }

    p[err]{
        font-size: 14px;
        color: var(--typo-alert);
        margin-top: 5px;
    }

    .footer-container{
        display: flex;
        gap: 12px;

        .err{
            height: 32px;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: var(--typo-alert);
        }
        
        .btn{
            height: 32px;
            width: max-content;
            padding: 0 16px 1px;
            font-size: 14px;
        }
    }

    .inp-wr{
        display: flex;
        align-items: start;
        gap: 13px;

        
        .title{
            min-height: 32px;
            width: 100%;
            max-width: 430px;
            padding: 5px 0;
        }

        .text-input{
            width: 108px;

            :deep(input){
                text-align: center;
            }
        }
    }
</style>