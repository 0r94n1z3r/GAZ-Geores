<template>
    <div class="charts">
        <div class="chart-wr">
            <h3>Общие затраты капитальных вложений</h3>
            <apexchart
                class="chart"
                width="600"
                type="donut"
                :options="donutOptions"
                :series="donutSeries"
            />
        </div>

        <div class="chart-wr">
            <h3>Распределение капитальных вложений по годам, млн. ₽</h3>
            <apexchart 
                class="chart"
                width="800" 
                type="bar" 
                :options="barOptions" 
                :series="barSeries"
            />
        </div>
    </div>
</template>

<script setup>
    import { round } from "@/helpers/number.js";

    import { computed } from "vue";
    
    import VueApexCharts from "vue3-apexcharts";

    import chroma from "chroma-js"

    const props = defineProps({
        info: Object,
        year: Number,
        yearN: Number,
    });

    const arr = computed(()=>Object.values(props.info));

//donut
    let donutSeries = computed(()=>arr.value.map(e => e.values.reduce((v,acc)=>acc+v,0)));

    let donutOptions = computed(()=>{
        return {
            stroke: {
                width: 3,
                lineCap: "round",
            },
            labels: arr.value.map(e => e.verbose_name),
            colors: chroma.scale(['rgba(0,120,210,1)', 'rgba(0,120,210,0.4)']).colors(arr.value.length),
            plotOptions: {
                pie: {
                    donut: {
                        size: "55%",
                    },
                },
            },
        }
    });

//bar
    let barSeries = computed(()=>[
        {
            name: '',
            data: 
            arr.value
            .map(e => e.values)
            .reduce((e,acc) => 
                acc.map((i,k) => i + e[k]), 
                new Array(arr.value[0].values.length).fill(0)
            )
        }
    ]);

    let barOptions = computed(()=>{
        return {
            labels: new Array(props.yearN).fill().map((e,k) => props.year+k),
            colors: chroma.scale(['rgba(0,120,210,1)', 'rgba(0,120,210,0.4)']).colors(arr.value.length),
            xaxis: {
                labels: {
                    rotate: -90 
                }
            },
            yaxis: {
                labels: {
                    formatter: (val) => round(val, 0, {splitThree: true})
                }
            },
            dataLabels: {
                enabled: false,
            }
        }
    });

</script>

<style lang="scss" scoped>
    h3{
        margin-bottom: 36px;
    }

    .charts{
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
    }
</style>