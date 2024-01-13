<template>
    <div class="distr-chart" :type="distr.name">
        <div class="chart-title">
            <div class="title">Частота</div>
        </div>
        <div class="charts-wr">
            <div class="chart-wr">
                <apexchart
                    width="100%"
                    height="100%"
                    
                    :options="histChart.options"
                    :series="histChart.series"

                    v-if="data?.length"
                />
                <apexchart
                    width="100%"
                    height="100%"
                    
                    :options="curveChart.options"
                    :series="curveChart.series"
                />
            </div>
        </div>
        
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from 'vue';
    import linspace from 'compute-linspace';
    import { round } from "@/helpers/number.js"

    const props = defineProps({
        data: Array,
        params: {
            type: Array,
            default: []
        },
        range: Array,
        distr: Object,
        roundTo: {
            type: Number,
            default: 0
        }
    });

//hist
    const rangeLimitedData = computed(()=>props.data ? props.data.filter(e => e>=props.range[0] && e<=props.range[1]) : [])

    const histArray = computed(()=>{
        let dt = rangeLimitedData.value;

        let ticks = 32;//Math.ceil(Math.sqrt(dt.length));

        let colsArr = [];
        
        for(let i = 0; i < ticks; i++)colsArr[i]=0;

        dt.forEach((e) => {
            let id = Math.floor(ticks * ((e-props.range[0]) / (props.range[1]-props.range[0])))
            if(id == ticks)id = ticks-1;
            colsArr[id] += 1;
        })

        return colsArr;
    })

    const histChart = computed(()=>{
        let chart = {
            options: {
                xaxis: {
                    tickAmount: histArray.value.length,
                    categories: linspace(props.range?.[0] || 0, props.range?.[1] || 0, histArray.value.length),
                    type: 'numeric',
                    decimalsInFloat: props.roundTo,
                    labels:{
                        formatter: e=>round(e, props.roundTo, {splitThree: true, constantDecimal: true}),
                        hideOverlappingLabels: false,
                        maxHeight: 360,
                        rotateAlways: true,
                        rotate: -75
                    }
                },
                yaxis: {
                    tickAmount: 6,
                },
                colors: ['var(--bg-control-primary)'],
                grid: {
                    xaxis: {
                        lines: {
                            show: true,
                        }
                    },
                    yaxis: {
                        lines: {
                            show: true,
                        }
                    },
                },
                chart: {
                    type: 'bar',
                    toolbar: {
                        tools: {
                            download: false,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false
                        },
                        show: false,
                    }
                },
                legend: {
                    show: false
                },
                dataLabels: {
                    enabled: false
                },
            },
            series: [
                {
                    name: "Данные",
                    data: histArray.value
                }
            ],
        }

        return chart;
    })

//curve
    const getCurvePoints = (
        formula=()=>null,
        min,
        max,
        ticks
    )=>{
        let arr = linspace(min, max, ticks);

        if(min == max){
            return [{x:0, y:0}]
        }

        return arr.map(e => {
            return {
                x: e,
                y: formula(e, props.params) || 0
            };
        });
    }

    const curveChart = computed(()=> {
        let chart = {
            options: {
                xaxis: {
                    tickAmount: 32,
                    // categories: linspace(props.range?.[0] || 0, props.range?.[1] || 0, 32),
                    type: 'numeric',
                    decimalsInFloat: props.roundTo,
                    labels:{
                        formatter: e=>round(e, props.roundTo, {splitThree: true, constantDecimal: true}),
                        hideOverlappingLabels: false,
                        maxHeight: 360,
                        rotateAlways: true,
                        rotate: -75
                    }
                },
                yaxis: {
                    tickAmount: 6,
                    type: 'numeric',
                    decimalsInFloat: 3,
                    labels:{
                        formatter: e=>props.data?.length?Math.max(...histArray.value):round(e, 3, {splitThree: true, constantDecimal: true})
                    }
                },
                colors: ['var(--bg-border-focus)'],
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                chart: {
                    // type: 'line',
                    toolbar: {
                        tools: {
                            download: false,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false
                        },
                        show: false,
                    }
                },
                grid: {
                    xaxis: {
                        lines: {
                            show: true,
                        }
                    },
                    yaxis: {
                        lines: {
                            show: true,
                        }
                    },
                },
                legend: {
                    show: false
                },
                dataLabels: {
                    enabled: false
                },
            },
            series: [
                {
                    name: "Кривая",
                    data: getCurvePoints(props.distr.func, props.range[0] || 0, props.range[1] || 0, 150)
                }
            ],
        }

        return chart;
    });

//zoom
    // const chart = ref();
    // const zoomLevel = ref(0);
    // const zoomStep = computed(()=>(props.range[1] - props.range[0])*.1);

    // const zoom = ()=>{
    //     if(
    //         props.range[0] + (zoomLevel.value+1)*zoomStep.value == 
    //         props.range[1] - (zoomLevel.value+1)*zoomStep.value
    //     )return;
    //     zoomLevel.value++;
    // };

    // const unzoom = ()=>{
    //     zoomLevel.value--;
    // };

    // watch(zoomLevel, n => {
    //     if(chart.value.chart)chart.value.zoomX(props.range[0] + n*zoomStep.value, props.range[1] - n*zoomStep.value);
    // })

    // defineExpose({zoom, unzoom});


    
</script>

<style lang="scss" scoped>
    .distr-chart{
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
        display: flex;

        .chart-title{
            @include flex-c;
            width: 12px;
            flex-shrink: 0;
            font-size: 12px;
            margin-right: -12px;

            .title{
                transform: rotate(-90deg);
            }
        }

        .charts-wr{
            position: relative;
            width: 100%;
            height: 100%;
        }

        .chart-wr{
            position: absolute;
            height: 100%;
            width: 100%;
            bottom: 0;
            left: 0;
        }

        
        .chart-wr{
            :deep(.apexcharts-bar-series){
                transform-origin: 50% 100%;
                transform: scaleX(0.968) translateX(-0.09%);
            }

            :deep(.vue-apexcharts:not(:first-child)){
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
                width: 100%;

                .apexcharts-line-series{
                    transform: scaleX(0.98);
                    transform-origin: 50% 100%;
                }

                .apexcharts-yaxis, .apexcharts-xaxis, .apexcharts-grid{
                    opacity: 0;
                }
            }
        }
        
    }
</style>