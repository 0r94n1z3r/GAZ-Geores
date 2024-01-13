<template>
    <div class="legend" :drop="drop || null" v-Click-Outside="()=>{drop = false}" >
        <VButton grey fit class="caller" @click="drop = !drop" >
            <IInfo class="ico"/>
        </VButton>
        <div class="container">
            <div class="blocks-container">
                <div class="block" v-for="(i,k) in Mining.chartScenes" :key="k" @click="activeObjectId = k">
                    <div class="color" :style="{background: objectsColors[k]}"></div>
                    <div class="block-title">{{i.title}}</div>
                </div>
            </div>
            <div class="colors-container">
                <div class="block" v-for="(i,k) in series" :key="k">
                    <div class="color" :style="{background: i.color}"></div>
                    <div class="block-title">{{i.name}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import IInfo from "@/components/icons/IInfo.vue";

    import chroma from "chroma-js"
    
    import { computed, ref } from "vue";

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import MiningStore from '@/stores/mining.js';

    const props = defineProps({
        data: Object
    });

    const Mining = MiningStore(); 

    const drop = ref(false);

    const activeObjectId = ref(0); 

//colors
    let baseAng = 202;

    const objectsColors = computed(()=>
        Mining.chartScenes.map((e,k)=>
            chroma((baseAng + k * (360/Mining.chartScenes.length)) % 360, 1, 0.5, 'hsl').toString()
        )
    );

    const series = computed(() => {
        let res = [];

        let ang = (baseAng + activeObjectId.value * (360/Mining.chartScenes.length)) % 360;
        let grad = chroma.scale([chroma(ang, 1, 0.25, 'hsl'), chroma(ang, 1, 0.5, 'hsl'), chroma(ang, 1, 0.9, 'hsl')]);

        Object.keys(Object.assign({}, ...Mining.resGroupFilters.map(e => e.columns)) || {})
        .forEach((key,n,arr) => {
            if(key == 'year' || !Mining.resFilters[key]?.verbose_name)return;

            res.push({
                name: Mining.resFilters[key]?.verbose_name,
                color: grad(n/arr.length).toString()
            });
        })
        
        return res;
    });

    
</script>

<style lang="scss" scoped>
    .legend{
        position: relative;
        width: max-content;
        
        .btn.caller{
            padding: 5px;

            .ico{
                height: 14px;
                width: 14px;
            }
        }

        .container{
            position: absolute;
            top: 100%;
            left: 0;
            background: var(--bg-default);
            width: 100%;
            z-index: 1;
            transition: 0.3s;
            border-radius: 0.4px;
            box-shadow: 0px 4px 4px 0px rgba(0, 32, 51, 0.0392156863);
            width: max-content;
            z-index: 5;
            max-width: 500px;

            .block{
                display: flex;
                gap: 6px;
                padding: 5px 10px;

                
                .color{
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    margin-top: 2px;
                    flex-shrink: 0;
                }
            }

            .blocks-container{
                display: flex;
                flex-wrap: wrap;
                border-bottom: 1px solid var(--bg-border);
                padding: 4px 0;

                .block{
                    width: 33.333%;
                    cursor: pointer;
                }
            }

            .colors-container{
                padding: 4px 0;
            }
        }

        &:not([drop]){
            .container{
                @include hidden(-10px);
            }
        }
    }
</style>