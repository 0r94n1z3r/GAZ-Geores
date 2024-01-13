<template>
    <div>
        <h3>Геологические запасы</h3>

        <div class="hists-switch">
            <label class="item radio" v-for="(i,k) in histsKeysList" :key="k"><input type="radio" :value="k" v-model="activeHistId"><span>{{i.title}}</span></label>
        </div>

        <ReservesChart v-if="activeHist.hist" :data="activeHist.hist" :percs="activeHist.percs"/>
    </div>
</template>

<script setup>
    import ReservesChart from "./ReservesChart.vue";
    import VToggleSwitch from "@/components/ui/VToggleSwitch.vue";

    import { computed, onMounted, ref, watch } from "vue";

    const props = defineProps({
        report: Object,
        fluidType: String
    });   

    const histsKeysList = computed(()=>
        [
            {
                title: `Геологические запасы, ${props.fluidType=='oil'?'тыс. т':'млн м³'}`,
                key: 'q'
            },
            {
                title: `Геологические запасы с учетом риска (gCoS), ${props.fluidType=='oil'?'тыс. т':'млн м³'}`,
                key: 'q_gcos'
            },
            {
                title: 'Геологические запасы конденсата, тыс. т',
                key: 'q_condensate', 
                fluidType: 'gas'
            },
            {
                title: 'Геологические запасы конденсата с учетом риска (gCoS), тыс. т',
                key: 'q_condensate_gcos',
                fluidType: 'gas'
            },
            {
                title: 'Геологические запасы растворенного в нефти газа, млн м³',
                key: 'q_gas_gcos',
                fluidType: 'oil'
            },
            {
                title: 'Геологические запасы растворенного в нефти газа с учетом риска (gCoS), млн м³',
                key: 'q_gas',
                fluidType: 'oil'
            },
        ].filter(e => 
            !e.fluidType || e.fluidType == props.fluidType
        )
    );

    const activeHistId = ref(0);
    const activeHist = computed(()=>{
        const key = histsKeysList.value[activeHistId.value]?.key || histsKeysList.value[0].key
        return {
            hist: props.report.histograms[key],
            percs: props.report.percentiles[key]
        }
    });
</script>

<style lang="scss" scoped>
    .toggle-wr{
        display: flex;
        align-items: end;
        justify-content: end;
        gap: 10px ;
        width: 100%;
    }

    .hists-switch{
        padding: 10px 5px;
        @include flex-col;
        gap: 5px;

        span{
            font-size: 14px;

            &::before, &::after{
                transform: translateY(1px);
            }
        }
    }
</style>