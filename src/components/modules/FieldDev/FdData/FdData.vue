<template>
    <LayFooterPage reversed :hideFooter="!model || model?.loading">
        <div class="content-block general-content">
            <h2>Общие сведения</h2>
            <div class="input-wr">
                <p>Регион строительства</p>
                <TextSelect class="input" v-model="region" type="number" :locked="model || null" :list="FD().regions" keyName="name"/>
            </div>
            <div class="input-wr" v-if="model?.cost_start_year">
                <p>Начало эксплуатации</p>
                <VTextInput class="input" locked v-model="model.cost_start_year"/>
            </div>
            <div class="input-wr btns" v-if="!model?.loading">
                <VButton v-if="model" red hollow fit @click="deleteModel">Удалить модель</VButton>
                <VButton v-else fit @click="addModel">Добавить модель</VButton>
            </div>
        </div>

        <p err>{{err}}</p>

        <VLoading v-if="model?.loading"/>        
        
        <div class="content-block" v-else-if="model">
            <h2>Параметры системы</h2>
            <p class="caption">Укажите параметры системы сбора</p>

            <div class="param-block" v-for="(i,k) in model.data" :key="k">
                <h3>{{i.verbose_name}}</h3>

                <div class="input-wr" v-for="(c,ck) in i.columns" :key="ck">
                    <div class="title">
                        <p>{{c.verbose_name}}{{c.units?', ':''}}<span v-if="c.units">{{c.units}}</span></p>
                        <p err v-if="c.err && c.boolean">{{c.err}}</p>
                    </div>

                    <div v-if="c.boolean" class="bool">
                        <div class="no-data" v-if="c.value == null" @click="()=>{c.value = true; upload(c, ck, 1)}">
                            добавить значение
                        </div>
                        <div class="inputs" v-else>
                            <label class="checkbox">
                                <input type="checkbox" @change="upload(c, ck, c.value?1:0)" v-model="c.value">
                                <span></span>
                            </label>
                        </div>
                    </div>

                    <VTextInput v-else blurOnly @update="upload(c, ck, $event)" :err="c.err" err-absolute v-model="c.value" class="input" type="number"/>
                </div>
            </div>
        </div>

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

    import { useProjectStore } from "@/stores/project.js";
    import FD from "@/stores/fieldDev.js";
    import { computed, onMounted, ref, watch } from "vue";

    import R from "@/stores/routerControl.js";

    import fdAPI from "@/script/fieldDev.js";

    const Proj = useProjectStore();
    const model = computed(()=>FD().activeModel); 

    const err = ref();

//update
    const update = ()=>{
        FD().updateModelByGroup(
            FD().activeGroupId,
            (error)=>err.value=error
        );
    }

    onMounted(update);
    watch(()=>[FD().activeGroupId, R().route?.meta?.mode], update);

//pre
    const region = ref(model.value?.specific_cost?FD().regions.find(e => e.id == model.value?.specific_cost):FD().regions[0]);

    watch(()=>[model.value?.id, FD().activeGroupId, FD().regions], (n)=>{
        region.value = model.value?.specific_cost?FD().regions.find(e => e.id == model.value?.specific_cost):FD().regions[0];
    })

//add
    const addModel = ()=>{
        FD().addModel(
            FD().activeGroupId,
            region.value.id,
            (error)=>err.value=error
        );
    }

//delete
    const deleteModel = ()=>{
        FD().deleteModel(
            error => err.value=error
        );
    }

//upload
    const upload = (obj, col, value)=>{
        console.log(col, value);

        model.up_to_date_calculation = false; 
        obj.err = false;
        
        fdAPI.model.data.set.input(
            model.value.id,
            col,
            value,
            (res)=>{
                model.value.has_all_data =  Object.values(Object.assign({}, ...model.value.data.map(e => e.columns).flat())).every(e => e.value != null);
                console.log(res);
            }, 
            err=>{
                obj.err = Object.values(err).flat();
            }
        )
    }

//calculate
        const calcLoading = ref();
        const calcErr = ref();

        const calculate = ()=>{
            calcLoading.value = true;
            calcErr.value = false;
            model.value.up_to_date_calculation = false;
            
            fdAPI.model.calculate(
                model.value?.id,
                res => {
                    model.value.up_to_date_calculation = true;
                    FD().setType(1);
                    calcLoading.value = false;
                }, 
                error => {
                    calcErr.value = error;
                    calcLoading.value = false;
                }
            );
        }
 
</script>

<style lang="scss" scoped>
    .content-block{
        @include flex-col;
        gap: 10px;

        margin-bottom: 40px;
    }

    .general-content{
        .input-wr p{
            margin-bottom: 6px;
        }

        .input{
            max-width: 250px;
        }

        .btns{
            .btn{
                height: 32px;
            }
        }
    }

    .caption{
        color: var(--typo-control-ghost);
        font-size: 14px;
        margin-top: -10px;
    }

    .param-block{
        @include flex-col;
        gap: 10px;

        padding: 16px 0;
        padding-left: 16px;
        

        &:not(:last-child){
            border-top: 1px solid var(--bg-border);
        }

        h3{
            margin-left: -16px;
        }

        .input-wr{
            display: flex;
            gap: 20px;

            .title{
                align-self: center;
                width: 100%;
                max-width: 400px;
            }

            .input{
                max-width: 150px;
            }
        }

        label{
            font-size: 16px;
        }
    }

    p[err]{
        color: var(--typo-alert);
        font-size: 14px;
    }

    .bool{
        min-height: 32px;

        

        .inputs{
            display: flex;
            height: 32px;
            align-items: center;

            label{
                height: 16px;
            }
        }

        .no-data{
            cursor: pointer;
            color: var(--typo-brand);
            height: 32px;
            display: flex;
            align-items: center;

            &:hover{
                color: var(--bg-shadow);
            }
        }
    }

    .footer-container{
        display: flex;
        gap: 12px;
        align-items: center;

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
</style>