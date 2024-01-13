<template>
    <div>
        <h3>Торнадо-диаграмма</h3>

        <div class="switch">
            <div class="mode" :active="mode == 0 || null" @click="mode = 0">{{fluidType=='oil'?'тыс. т':'млн м³'}}</div>
            <div class="mode" :active="mode == 1 || null" @click="mode = 1">%</div>
        </div> 
        
        <div class="analysis">
            <div class="row">
                <div class="col"></div>
                <div class="col"><span>P<span class="sub">50</span> = {{round(report.percentiles.q.p50, D.getRoundTo('q'), {splitThree: true})}}</span></div>
            </div>

            <div class="row" v-for="(i,k) in analysis" :key="k">
                <div class="col">{{i.name}}</div>
                <div class="col">
                    <div class="chart">
                        <div class="spacer" :style="`width: ${(round(maxAnalysis.value, i.roundTo, {splitThree: true})+'').length * 6}px`"></div>
                        <div class="content">
                            <div class="value">{{
                                mode?
                                round(math.evaluate(`((${i.value[0]} * 100) / ${report.percentiles.q.p50}) - 100`), i.roundTo):
                                round(i.value[0], i.roundTo, {splitThree: true})
                            }}</div>
                            
                            <div class="line" :style="`width: calc(${100 * math.evaluate(`${i.width[0] || 0} / ${maxAnalysis.width}`)}%)`"></div>
                        </div>
                    </div>
                    <div class="chart">
                        <div class="spacer" :style="`width: ${(round(maxAnalysis.value, i.roundTo, {splitThree: true})+'').length * 6}px`"></div>
                        <div class="content">
                            <div class="value">{{
                                mode?
                                round(math.evaluate(`((${i.value[1]} * 100) / ${report.percentiles.q.p50}) - 100`), i.roundTo):
                                round(i.value[1], i.roundTo, {splitThree: true})
                            }}</div>
                            <div class="line" :style="`width: calc(${100 * math.evaluate(`${i.width[1] || 0} / ${maxAnalysis.width}`)}%)`"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { round } from '@/helpers/number.js';

    import { computed, ref, watch } from "vue";

    import { create, all } from 'mathjs';

    import { useDistributionStore } from "@/stores/distribution.js";

    const props = defineProps({
        report: Object,
        columns: Array,
        fluidType: String
    });

    const math = create(all, {number: 'BigNumber'});

    const D = useDistributionStore();

//mode
    const mode = ref(0);

//analysis
    const analysis = computed(
        ()=>{
            let res =  props.columns.map((e)=>{
                return {
                    name: e.verbose_name,
                    value: [
                        props.report?.influences?.q_min?.[e.title],
                        props.report?.influences?.q_max?.[e.title]
                    ],
                    width: [
                        props.report?.influences?.q_delta_min?.[e.title],
                        props.report?.influences?.q_delta_max?.[e.title]
                    ],
                    delta: props.report?.influences?.q_delta?.[e.title],
                    roundTo: 0//e.round_to
                }
            }).sort((a,b)=>{
                if ( a.delta > b.delta ) return -1;
                if ( a.delta < b.delta ) return 1;
                return 0;
            }).slice(0,5);

            return res;
        }
    );

    const maxAnalysis = computed(()=>{
        return {
            width: Math.max(...analysis.value.map(e => e.width).flat().filter(e=>e)),
            value: Math.max(...analysis.value.map(e => e.value).flat().filter(e=>e)),
        }
    });
</script>

<style lang="scss" scoped>
    .switch{
        display: flex;
        gap: 10px;

        .mode{
            padding: 1px 7px 3px;
            border-radius: 4px;
            border: 1px solid var(--bg-border);
            cursor: pointer;
            margin-top: 12px;

            &[active]{
                border-color: var(--bg-border-focus);
            }
        }
    }

    .analysis{
        .row{
            display: flex;
            
            &:not(:first-child){
                border-top: 1px solid var(--bg-control-ghost);
            }

            .col{
                width: 50%;
                justify-content: center;

                &:first-child{
                    padding: 12px 0;
                    padding-right: 15px;
                }

                &:last-child{
                    display: flex;
                    position: relative;

                    .chart{
                        width: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: end;
                        font-size: 12px;
                        position: relative;

                        .spacer{
                            flex-shrink: 0;
                        }

                        .content{
                            display: flex;
                            width: 100%;
                            align-items: center;
                            justify-content: end;
                            gap: 8px;
                            position: relative;

                            .line{
                                height: 24px;
                                background: var(--typo-ghost);
                            }

                            .value{
                                width: 1px;
                                white-space: nowrap;
                                display: flex;
                            }
                        }
                        
                        &:first-child{
                            .content{
                                .value{
                                    justify-content: end;
                                }
                            }
                        }

                        &:last-child{
                            flex-direction: row-reverse;
                            .content{
                                flex-direction: row-reverse;
                                justify-content: start;

                                .line{
                                    background: var(--typo-secondary);
                                }
                            }

                            &::after{
                                @include pseudo-absolute;
                                @include directions(-1px, auto, 0, -1px);
                                height: calc(100% + 2px);
                                width: 2px;
                                margin: auto;
                                background: var(--c-dark);
                            }
                        }

                        
                    }
                }
            }
        }
    }
</style>