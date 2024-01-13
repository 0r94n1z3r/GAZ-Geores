<template>
    <div class="reserves-chart">
        <div class="titles">
            <div class="title">
                <div class="title-wr" :style="{background: 'var(--bg-normal)', color: '#fff'}">
                    <span>Частота</span>
                </div>
            </div>
        </div>
        <div class="charts-container">
            <apexchart
                width="100%"
                height="100%"
                type="bar"
                :options="chartParams.options"
                :series="chartParams.series"
            />
        </div>
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { round } from "@/helpers/number.js"

    const props = defineProps({
        data: Object,
        percs: Object
    });

    const chartParams = computed(()=>{
        const anno = (perc, title)=>{
            return {
                line: {
                    x: perc,
                    strokeDashArray: 0,
                    borderColor: '#000'
                },
                text: {
                    x: perc,
                    y: null,
                    marker: {
                        size: 0,
                        strokeWidth: 0,
                        radius: 0,
                    },
                    label: {
                        borderColor: 'var(--bg-border)',
                        borderWidth: 1,
                        borderRadius: 2,
                        mouseEnter: e=>{
                            document.querySelectorAll('.resc-label, .apexcharts-point-annotations rect').forEach(e =>e.style.opacity = 0)
                            document.querySelector(`.resc-label-${title}`).style.opacity = 1;
                        },
                        mouseLeave: e=>{
                            document.querySelectorAll('.resc-label, .apexcharts-point-annotations rect').forEach(e =>e.style.opacity = 1)
                        },
                        text: `${title}=${round(perc, 0, {splitThree: true})}`,
                        textAnchor: 'middle',
                        style: {
                            background: '#fff',
                            fontSize: '14px',
                            padding: {
                                left: 5,
                                right: 5,
                                top: 0,
                                bottom: 2,
                            },
                            cssClass: 'resc-label resc-label-'+title
                        },
                    },
                }
            }
            
        }

        return {
            options: {
                chart: {
                    type: 'bar',
                    toolbar: {
                        show: false,
                        tools: {
                            download: false,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false
                        },
                    }
                },
                xaxis: {
                    categories: props.data.bin_edges,
                    tickAmount: props.data.bin_edges.length - 1,
                    type: 'numeric',
                    decimalsInFloat: 0,
                    labels:{
                        formatter: e=>round(e, 0, {splitThree: true, constantDecimal: true}),
                        hideOverlappingLabels: false,
                        maxHeight: 360,
                        rotate: -75
                    }
                    
                },
                yaxis: {
                    tickAmount: 10,
                    formatter: (val) => round(val, 0, {splitThree: true})
                },
                colors: ['var(--bg-normal)'],
                legend: {
                    show: false
                },
                dataLabels: {
                    enabled: false
                },

                annotations: {
                    xaxis: [
                        anno(props.percs.p10, 'P10').line,
                        anno(props.percs.p50, 'P50').line,
                        anno(props.percs.p90, 'P90').line
                    ],
                    points: [
                        anno(props.percs.p10, 'P10').text,
                        anno(props.percs.p50, 'P50').text,
                        anno(props.percs.p90, 'P90').text
                    ]
                }
            },
            series: [
                {
                    name: "Частота",
                    data: props.data.hist
                },
            ],
        }
    })
    
</script>

<style lang="scss" scoped>
    

    .reserves-chart{
        display: flex;

        .titles{
            gap: 8px;
            height: 280px;
            flex-shrink: 0;

            .title{
                height: 100%;
                width: 32px;
                flex-shrink: 0;
                padding-bottom: 36px;

                &-wr{
                    border-radius: 4px;
                    height: 100%;
                    width: 100%;
                    @include flex-c;
                }

                span{
                    color: inherit;
                    transform: rotate(-.25turn);
                }
            }
        }

        .charts-container{
            height: 280px;
            width: 100%;
            position: relative;
        }

        :deep(.apexcharts-bar-series){
            transform: translateX(1.5%);
        }
    }

    :deep(.anno-label){
        &[blank]{
            opacity: 0;
        }
    }

    :deep(.resc-label){
        transition: .3s;
    }
</style>