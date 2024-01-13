<template>
    <div class="eco-input">
        <div class="eco-input-wr">
            <div class="title-wr">
                <div class="p-wr">
                    <p>{{info.verbose_name}}<span v-if="info.units">, {{info.units}}</span></p>
                    <div class="control" v-if="info.array" :blank="!yDrop || null" @click="yDrop = !yDrop">
                        <IDropArr :style="{transform: `rotate(${yDrop?.5+'turn':0})`}" class="ico"/>
                    </div>
                </div>
                
                <div class="err" v-if="err">{{err}}</div>
            </div>
            
            <div class="inputs" :loading="loading || null">
                <!-- choice -->
                <div v-if="isType(['choice'])" class="choice-wr" :hor="Object.keys(info.choices).length <= 2 || null">
                    <div 
                        class="choice-item" 
                        v-for="(o, ok) in info.choices" 
                        :key="ok" 
                        :active="info.value[0] == ok || null"
                        @click="()=>{info.value[0] = ok; updateValue();}"
                    >   
                        <ILoader v-show="loading" class="loader"/>
                        {{o}}
                    </div>
                </div>
                
                <!-- input/float -->
                <div class="inps-wr" v-if="isType(['integer', 'float'])">
                    <div class="inp-wr" v-if="info.array"><div class="locked">{{model?.economic_start_year}}</div></div>
                    <div class="inp-wr">
                        <ILoader v-show="loading" class="loader"/>
                        <VTextInput v-model="info.value[0]" blurOnly @update="updateValue" type="number" :round-to="info.type == 'integer'?0:null"/>
                    </div>
                </div>

                <template v-if="info.array && yDrop && isType(['integer', 'float'])">
                    <div class="inps-wr" v-for="i in info.value.length-1" :key="i">
                        <div class="inp-wr" v-if="info.array"><div class="locked">{{model?.economic_start_year + i}}</div></div>
                        <div class="inp-wr">
                            <VTextInput v-model="info.value[i]" blurOnly @update="updateValue" type="number" :round-to="info.type == 'integer'?0:null"/>
                        </div>
                    </div>
                </template>
            </div>

            <VButton hollow class="copy-btn" :disabled="loading || null" v-if="info.array" @click="setToAll(info.value[0])">Дублировать по годам</VButton>
        </div>
        
        <div class="nest">
            <template v-for="(i,k) in info.dep">
                <EcoInput v-if="info.value[0] == i.depends_value" :info="i" :key="k" :colname="k" :model="model"/>
            </template>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref } from "vue";
    import EcoInput from "./EcoInput.vue";
    import IDropArr from "@/components/icons/IDropArr.vue";

    import ILoader from "@/components/icons/ILoader.vue";

    import { useProjectStore } from "@/stores/project.js";
    import Eco from "@/stores/economics.js";

    import eAPI from "@/script/economics.js"

    const props = defineProps({
        info: Object,
        colname: String,
        allData: Object,
        model: Object
    });

    const Proj = useProjectStore();

    const yDrop = ref(false);

    const isType = (types)=>types.includes(props.info.type);

    // onMounted(()=>{
    //     console.log(props.info);
    // })

//update
    const err = ref('');
    const loading = ref(false);

    let updateCooldownTimeout = null;
    let updateCooldown = false;
    const updateValue = ()=>{
        if(updateCooldown)return;

        if(updateCooldownTimeout)clearTimeout(updateCooldown);
        
        updateCooldown = true;
        updateCooldownTimeout = setTimeout(()=>{updateCooldown = false}, 100);
        Eco().activeModel.has_all_data = false;

        err.value = null; 
        loading.value = true;

        let dt = props.info.value.map(e => 
            isType(['integer', 'float'])?parseFloat(e):e
        )

        eAPI.model.data.set.input(
            Eco().activeModel?.id,
            props.colname,
            dt,
            (res) => {
                Eco().activeModel.has_all_data = 
                    Object.values(Object.assign(
                        ...Eco().activeModel.data
                        .map(e => e.columns)
                    ))
                    .every(e => 
                        e.value[0]!=null && 
                        (
                            !e.dep || 
                            Object.values(e.dep).every(j => j.depends_value != e.value[0] || j.value[0] != null)
                        )
                    )

                loading.value = false;
            },
            error => {
                err.value = error;

                loading.value = false;
            }
        )
    }

//setToAll
    const setToAll = (val)=>{
        props.info.value.forEach((e,k) => {
            props.info.value[k] = val;
        });
        updateValue();
    }
</script>

<style lang="scss" scoped>
    .eco-input-wr{
        display: flex;
        align-items: start;
        gap: 13px;

        .title-wr{
            align-items: start;
            gap: 10px;
            width: 430px;
            position: relative;

            .p-wr{
                display: flex;
                gap: 10px;
                width: 100%;
            }

            p{
                min-height: 32px;
                width: 100%;
                padding: 5px 0;

                span{
                    white-space: nowrap;
                }
            }
        
            .err{
                top: 100%;
                left: 0;
                color: var(--typo-alert);
                transform: translateY(-9px);
            }
    

            .control{
                --color: var(--bg-border);

                @include flex-c;
                height: 18px;
                width: 18px;
                flex-shrink: 0;
                border: 1px solid var(--color);
                border-radius: 50%;
                cursor: pointer;
                transition: .3s;
                margin-top: 7px;

                .ico{
                    color: var(--color);
                    width: 65%;
                    height: 65%;
                    transition: .3s;
                }

                &:hover{
                    --color: var(--bg-border-focus)
                }

                &[blank]{
                    background: var(--bg-control-primary);
                    border-color: transparent;

                    .ico{
                        color: var(--bg-default)
                    }
                }
            }
        }

        .inputs{
            position: relative;

            &[loading]{
                .inp-wr{
                    opacity: .7;
                    pointer-events: none;
                }
            }

            .loader{
                position: absolute;
                pointer-events: none;
                left: 0;
                right: 0;
                top: 12px;
                margin: auto;

                height: 10px;
                width: 30px;

                color: var(--bg-control-primary);
            }

            .inps-wr{
                display: flex;
                height: 32px;

                .inp-wr{
                    border: 1px solid var(--bg-border);
                    width: 108px;

                    &:first-child{
                        border-top-left-radius: 4px;
                        border-bottom-left-radius: 4px;
                    }
                    
                    &:last-child{
                        border-top-right-radius: 4px;
                        border-bottom-right-radius: 4px;
                    }

                    &:not(:last-child){
                        border-right-width: 0;
                    }

                    .input, .input input, .input .content{
                        text-align: center;
                        border: 0;
                        height: 100%;
                    }

                    .locked{
                        height: 100%;
                        font-size: 14px;
                        background: var(--bg-ghost);
                        @include text-overflow;
                        padding: 6.5px 8px;
                        text-align: center;
                    }

                    :deep(.text-input .content){
                        border: none;

                        input{
                            text-align: center;
                        }
                    }
                }

                &[blush]{
                    .inp-wr{
                        border-color: var(--typo-alert);
                    }
                }
            }
        }

        

        .copy-btn{
            height: 32px;
            width: max-content;
            padding: 0 14px;
            font-size: 14px;
            text-align: center;
        }

        .choice-wr{
            display: flex;
            border-radius: 4px;
            border: 1px solid #ccd9e0;
            overflow: hidden;
            background: var(--bg-border);
            
            gap: 1px;

            font-size: 14px;

            &:not([hor]){
                flex-direction: column;
            }

            .choice-item{
                background: var(--bg-default);
                padding: 7.5px 15px;
                cursor: pointer;
                position: relative;

                &[active]{
                    background: #edf2f4;
                    color: var(--bg-control-primary);
                }
            }
        }
    }

    .nest{
        @include flex-col;
        gap: 10px;

        &:not(:empty){
            margin-top: 10px;
            margin-left: 40px;
        }
    }
</style>