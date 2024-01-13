<template>
    <div class="data" v-if="report.histograms">
        <h1>Распределение запасов</h1>

        <div class="table">
            <div class="item">
                <div class="title">Дата</div>
                <div class="info">{{beautifyDate(new Date(proj.activeProjectDisplay?.simulation_date || proj.activeProjectDisplay?.created_at))}}</div>
            </div>
            <div class="item">
                <!-- <div class="title">Итог</div> -->
                <!-- <div class="info">Геологические запасы, млн м куб.</div> -->
            </div>
            <div class="item" v-if="report.n">
                <div class="title">Количество реализаций, ед.</div>
                <div class="info">{{info.n || report.n}}</div>
            </div>
            <div class="item" v-if="report.percentiles">
                <div class="title">Степень изученности (P<span class="sub">10</span>/P<span class="sub">90</span>), д. ед.</div>
                <div class="info">{{round((report.percentiles.q.p10 / report.percentiles.q.p90), D.getRoundTo('q'), {splitThree: true})}}</div>
            </div>
        </div>

        <div class="P-container" v-if="report.percentiles">
            <div class="item">P<span class="sub">90</span> = {{round(report.percentiles.q.p90, D.getRoundTo('q'), {splitThree: true})}}</div>
            <div class="item">P<span class="sub">50</span> = {{round(report.percentiles.q.p50, D.getRoundTo('q'), {splitThree: true})}}</div>
            <div class="item">P<span class="sub">10</span> = {{round(report.percentiles.q.p10, D.getRoundTo('q'), {splitThree: true})}}</div>
        </div>

        <div class="extra">
            <h3>Дополнительный перцентиль</h3>
            
            <div class="item">
                <div class="input-wr">                            
                    <VSelect 
                        :list="percColumns" 
                        v-model="extraPercColumn"
                        keyName="verbose_name"
                        class="select"
                    />
                    <VTextInput type="number" borders="[0;100]" v-model="extraPercValue" @keydown.enter="getExtraPerc"/>
                    <VButton :disabled="extraPercValue === '' || null" @click="getExtraPerc">Определить</VButton>
                </div>
            </div>
            <div class="item" v-if="extraPerc != null">
                <h4>Результат: {{round(extraPerc, D.getRoundTo('q'), {splitThree: true})}}</h4>
            </div>
            
        </div>
        
    </div>
</template>

<script setup>
    import { useProjectStore } from "@/stores/project.js";
    import { useDistributionStore } from "@/stores/distribution.js";
    import { Distribution } from "@/script/distribution.js";

    import { beautifyDate } from "@/helpers/date.js";
    import { round } from '@/helpers/number.js';

    import VSelect from "@/components/ui/VSelect.vue";
    
    import { computed, ref, watch } from "vue";

    const props = defineProps({
        report: Object,
        fluidType: String,
    });
    
    const proj = useProjectStore();

    const info = computed(()=>proj.currentLevel.content);

    const D = useDistributionStore();

//extra perc
    const extraPerc = ref(null);
    const extraPercValue = ref('');

    const percColumns = computed(()=>
        [
            {
                verbose_name: `Геологические запасы, ${props.fluidType == 'oil'?'тыс. т':'млн м³'}`,
                title: 'q'
            },
            {
                verbose_name: `Геологические запасы с учетом риска, ${props.fluidType == 'oil'?'тыс. т':'млн м³'}`,
                title: 'q_gcos'
            }
        ]
    );

    const extraPercColumn = ref(percColumns.value[0]);

    watch([extraPercColumn, extraPercValue], ()=>{
        extraPerc.value = null 
    })
    watch(()=>percColumns.value, ()=>{
        extraPercColumn.value = percColumns.value[0],
        extraPerc.value = null;
    })

    const getExtraPerc = ()=>{
        Distribution.getExtraPerc(extraPercColumn.value.title, extraPercValue.value, info.value.id, proj.currentLevel.level, props.fluidType, resp=>extraPerc.value = resp.value);
    }
</script>

<style lang="scss" scoped>
    .data{
        margin-bottom: 40px;
        
        h1{
            margin-bottom: 24px;
        }

        .table{
            display: grid;
            grid-template-columns: 300px 300px;
            gap: 20px;
            margin-bottom: 16px;

            .title{
                font-size: 16px;
                margin-bottom: 4px;
            }

            .info{
                font-size: 14px;
            }
        }

        .P-container{
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
            flex-wrap: wrap;
            

            .item{
                padding: 17px;
                border: 1px solid var(--bg-border);
                border-radius: 4px;
                transition: .3s;

                &[active]{
                    border-color: var(--bg-control-primary);
                }
            }
        }

        .extra{
            h3{
                margin-bottom: 8px;
            }

            .item{
                max-width: 450px;
                margin-bottom: 5px;

                h4{
                    color: var(--typo-secondary);
                    margin-bottom: 8px;
                }

                .input-wr{
                    display: flex;
                    gap: 8px;

                    .input{
                        width: 100px;
                        flex-shrink: 0;
                    }

                    .btn{
                        height: 32px;
                        width: max-content;
                        padding: 0 14px 1px;
                        flex-shrink: 0;
                    }
                }
            }
        }
    }
</style>