<template>
    <div class="chart-wr">
        <apexchart v-if="series[0]?.data" type="line" height="500" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script setup>
    import { computed } from "vue";

    import chroma from "chroma-js"

    import MiningStore from '@/stores/mining.js';


    import { useProjectStore } from "@/stores/project.js";

    const props = defineProps({
        data: Object
    })

    const Mining = MiningStore();

    const proj = useProjectStore();

    const dataArr = computed(()=>
        Object.entries(props.data).map(e => {
            return {title: e[0], data: e[1]}
        })
    );

//series
    let baseAng = 202;

    const selectedFilters = computed(()=>Object.fromEntries(Object.entries(Mining.resFilters).filter(e => e[1].value)))

    const series = computed(() => {
        if(!dataArr.value.length)return [];

        let res = [];

        dataArr.value.forEach((obj, k) => {
            let ang = (baseAng + k * (360/dataArr.value.length)) % 360;;
            let grad = chroma.scale([chroma(ang, 1, 0.25, 'hsl'), chroma(ang, 1, 0.5, 'hsl'), chroma(ang, 1, 0.9, 'hsl')]);

            Object.keys(selectedFilters.value || {}).map((key, n, arr) => {
                res.push({
                    name: selectedFilters.value[key].verbose_name,
                    key: key, 
                    data: obj.data?.[key],
                    color: grad(n/arr.length).toString()
                });
            })
        })

        //console.log(res);

        return res;
    });


//options
    const chartOptions =  computed(() => {
        const year = dataArr.value[0].data['year'];
        const startYear = proj.activeProject.mining_start_year;

        const ranges = Object.keys(selectedFilters.value || {}).reduce((acc, key) => {
            let vals = series.value?.filter(e => e.key == key)?.map(e => e.data).flat() || [];

            acc[key] = [
                Math.min(...vals),
                Math.max(...vals)
            ]

            return acc;
        }, {})

        const yAxis = series.value.map((e,k) => {
            return {
                show: k < Object.keys(selectedFilters.value || {}).length,
                axisTicks: {
                    show: true,
                    color: 'var(--bg-border-focus)'
                },
                axisBorder: {
                    show: true,
                    color: 'var(--bg-border-focus)'
                },
                tooltip: {
                    enabled: false
                },
                
                decimalsInFloat: 2,
                forceNiceScale: true,
                title: {
                    text: e.name,
                    style: {
                        color: 'var(--typo-secondary)',
                        fontWeight: 400,
                        fontFamily: 'inherit'
                    }
                },
                tickAmount: 6,
                min: ranges[e.key][0],
                max: ranges[e.key][1],
            }
        }) 

        return {
        chart: {
            height: 500,
            type: 'line',
            stacked: false,
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
            },
            animations: {
                enabled: false
            }
        },
        stroke: {
            width: 2
        },
        legend: {show: false},
        colors: series.value.map(e => e.color),
        xaxis: {
            categories: year.map((e,k) => startYear + e),
            tickAmount: Math.round(year.length / 5) + 2,
        },
        yaxis: yAxis
    }})
</script>

<style lang="scss" scoped>

</style>