<template>
    <div>
        <div class="controls">
            <div class="distrType">
                <h4>Тип распределения</h4>
                <VSelect 
                    :list="distrsList" 
                    v-model="activeDistr"
                    keyName="locName"
                    extraKey="extra"
                    class="select"
                />
            </div>

            <div class="borders" v-if="params.borders?.length">
                <h4>Диапазон пользовательских значений (от, до)</h4>
                <div class="values">
                    <div class="block" v-for="(i,k) in params.borders" :key="k">
                        <VTextInput err-absolute :delay="300" type="number" v-model="i.value"/>
                    </div>
                </div>
            </div>
            

            <!-- <div class="zoom-contols">
                <div class="btn" @click="chart.unzoom()"><IZoomMinus/></div>
                <div class="btn" @click="chart.zoom()"><IZoomPlus/></div>
            </div> -->
        </div>
        
        <DistrChart 
            v-if="activeDistr?.hasChart"
            :params="colInfo.params_input" 
            :range="[colInfo.params_input?.find(e => e.name == 'minval')?.value || 0, colInfo.params_input?.find(e => e.name == 'maxval')?.value || Math.max(...(colInfo?.data?colInfo?.data:[0]))]"
            :data="colInfo.data" 
            :distr="activeDistr"
            :round-to="info.roundTo"
            ref="chart"
        />


        <div class="values" v-if="params.other">
            <div class="block" v-for="(i,k) in params.other" :key="k">
                <div class="title" :class="{'switch': hasPerc(i.name)}">
                    <h4 :active="!i.perc || null" @click="i.perc = false">
                        {{i.title}}
                    </h4>
                    <h4 :active="i.perc || null" @click="i.perc = true" class="perc" v-if="hasPerc(i.name)">
                        P 
                        <div class="perc-loader" v-show="i.percLoading"><VLoading hollow/></div>
                    </h4>
                </div>
                <VTextInput err-absolute :delay="300" type="number" v-model="i.value" v-if="!i.perc"/>
                <!-- :borders="!(i.name == 'maxval' || i.name == 'minval')?`[0;]`:null" -->
                <div class="perc-input-wr" v-else>
                    P
                    <VTextInput 
                        class="perc-input"
                        type="number"
                        placeholder="90" 

                        v-model="i.percentile"

                        err-absolute 
                        
                        :delay="300" 
                        borders="[0;100]"
                        :err="i.err"

                        @update="percUpdate(i)"
                        @blur="i.err = null"
                    />
                    =
                    <VTextInput 
                        type="number" 

                        v-model="i.pvalue"

                        err-absolute 
                        
                        :delay="300" 
                        :err="i.err"
                        
                        @update="percUpdate(i)"
                        @blur="i.err = null"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import VSelect from "@/components/ui/VSelect.vue";
    import VTextInput from "@/components/ui/VTextInput.vue";

    import IZoomMinus from "@/components/icons/IZoomMinus.vue";
    import IZoomPlus from "@/components/icons/IZoomPlus.vue";
    
    import DistrChart from "./DistrChart.vue";

    import { useDistributionStore } from "@/stores/distribution.js"
    import { useProjectStore } from "@/stores/project.js";

    import { Distribution } from "@/script/distribution.js";

    import { round } from '@/helpers/number.js';

    const props = defineProps({
        info: Object,
        type: String
    })
    
    const DistrStore = useDistributionStore();

    const content = computed(()=>useProjectStore().currentLevel?.content);
    const colInfo = computed(()=>content.value.distribution_data?.columns[props.type]);

    const activeDistr = ref();

    const updateProps = (override)=>{
        DistrStore.updateProps(content.value, props.type, activeDistr.value?.name, override);
    };

    onMounted(()=>{
        let override = false;
        if(!colInfo.value.distribution){
            override = true;
            if(colInfo.value?.data?.length){
                activeDistr.value = DistrStore.distrs.find(e => e.name == 'sample');
            }else{
                activeDistr.value = DistrStore.distrs[0];
            }
        }else{
            activeDistr.value = DistrStore.distrs.find(e => e.name == colInfo.value.distribution);
        }

        updateFit();

        updateProps(override);
        watch(activeDistr, ()=>updateProps(true));
    })

//params
    const params = computed(()=>{
        return {
            borders: colInfo.value?.params_input?.filter(e => e.name == 'minval' || e.name == 'maxval') || [],
            other: colInfo.value?.params_input?.filter(e => e.name != 'minval' && e.name != 'maxval') || []
        }
    })

//fit
    const updateFit = ()=>{
        if(colInfo.value?.data){
            Distribution.fit(props.info.type, content.value.id, (res)=>{
                let d = {};

                res.forEach(e => {
                    d[e.distribution] = e;
                });

                colInfo.value.fit = d;
            });
        }else{
            colInfo.value.fit = null;
        }
    }

    watch(()=>colInfo.value.data, updateFit);

    const distrsList = computed(()=>{
        if(!colInfo.value?.fit)return DistrStore.distrs.filter(e => e.name != 'sample');

        return DistrStore.distrs.map(e => {
            let res = e;

            res.extra = 
                colInfo.value?.fit[e.name] && 
                `
                Оценка: ${round(colInfo.value.fit[e.name].ks_score, 3, {splitThree: true})}; 
                P: ${round(colInfo.value.fit[e.name].ks_pvalue, 3, {splitThree: true})}
                `

            return res;
        })
    })

//ref
    const chart = ref();

//perc
    const hasPerc = (name)=>name != 'maxval' && name != 'minval';

    const percUpdate = (i)=>{
        i.err = '';
        
        if(i.percentile == null || i.pvalue == null)return;
        
        // if(!colInfo.value.params_input.filter(e => e.percentile != null || e.value != null) != colInfo.value.params_input.length){
        //     i.percLoading = false;
        //     i.debt = true;
        //     return;
        // };

        i.percLoading = true;

        Distribution.getTrueParams(
            content.value.id,
            colInfo.value.distribution,
            colInfo.value.params_input.map((e,k) => (!e.percentile && e.value == null)?Object.assign({},e, {value: `0.${k}`}):e),
            res => {
                colInfo.value.params_input.forEach(e => {
                    console.log(e);
                    if(e.value != null || e.perc)e.value = res.params[e.name];
                    console.log(e);
                });

                i.debt = false;
                i.percLoading = false;
            },
            err => {
                // i.err = Object.entries(Object.entries(Object.entries({
                //     err
                // })[0][1] || {})[0][1] || {})[0] || err;
                i.err = err;

                i.debt = false;
                i.percLoading = false;
            }
        )
    }
    
</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    h4{
        font-size: 14px;
    }

    .controls{
        @include flex-jtf;
        align-items: end;
        margin-bottom: 14px;
        gap: 24px;

        h4{
            margin-bottom: 8px;
        }
        
        .distrType{
            width: 213px;
        }

        .zoom-contols{
            display: flex;
            

            .btn{
                width: 40px;
                height: 30px;
                color: var(--bg-tone);
                border: 1px solid var(--bg-border);
                @include flex-c;
                cursor: pointer;
                transition: .3s;

                &:hover{
                    background: var(--bg-ghost);
                }

                &:active{
                    transition: 0;
                    background: var(--bg-border);
                }

                &:first-child{
                    border-radius: 4px 0 0 4px;
                }

                &:last-child{
                    border-radius: 0 4px 4px 0;
                }

                &:not(:last-child){
                    border-right: 0;
                }
            }
        }

        .values{
            display: flex;
            flex-wrap: unset;
            
            .block{
                max-width: 220px;
            }
        }
    }

    .distr-chart{
        height: calc(90vh - 390px);
        max-height: 250px;
        margin-bottom: 12px;
    }

    .values{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 24px;
        flex-wrap: wrap;

        .block{
            width: 100%;
            font-size: 14px;

            .title{
                display: flex;
                align-items: start;
                margin-bottom: 12px;
                gap: 16px;

                h4{
                    color: var(--typo-secondary);
                    position: relative;
                }

                &.switch{
                    padding-left: 5px;

                    h4{
                        cursor: pointer;
                        position: relative;

                        &:after{
                            @include pseudo-absolute;
                            @include directions(0, -5px, -1px, -5px);
                            border: 1px solid var(--bg-border);
                            border-radius: 4px;
                        }

                        &[active]:after{
                            border-color: var(--bg-border-focus);
                        }
                    }
                }

                .perc-loader{
                    position: absolute;
                    top: -60%;
                    left: -60%;
                    height: 220%;
                    width: 220%;
                    flex-shrink: 0;

                    :deep(.loader){
                        width: 100%;
                        height: 100%;
                    }
                }
            }

            
            .value{
                height: 32px;
                display: flex;
                align-items: center;
            }

            .perc-input-wr{
                display: flex;
                align-items: center;

                .text-input{
                    margin: 0 4px;
                    &:last-child{
                        margin-right: 0;
                    }
                }

                .perc-input{
                    width: 65px;
                }
            }
        }
    }
</style>