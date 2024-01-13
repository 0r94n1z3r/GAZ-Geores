<template>
    <div>
        <div class="title">
            <h1><IFilter/> Фильтры</h1>
            <VButton grey fit @click="flush()">Очистить</VButton>
        </div>
        <div class="filters">
            <div class="filter-group" v-for="(g,gk) in filteredGroups" :key="gk">
                <div class="group-title">{{g.verbose_name}}{{g?.units && `, `}}{{g.units}}</div>

                <MRTags :info="g" v-if="g.widget == 'dropdown'"/>
                <template v-else>
                    <template v-for="(i,k) in g.columns">
                        <label  class="checkbox" :key="k" v-if="i">
                            <input type="checkbox" v-model="i.value">
                            <span>{{i?.verbose_name}}<template v-if="!g.units">{{i?.units && `, `}}<span v-if="i?.units" class="unit">{{i?.units}}</span></template></span>
                        </label>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
    import IFilter from "@/components/icons/IFilter.vue";

    import MRTags from "@/components/modules/MiningCalc/MResults/ui/MRTags.vue";

    import MiningStore from '@/stores/mining.js';
    
    import { computed, onMounted } from "vue";

    const props = defineProps({
        data: Object
    });
    
    const Mining = MiningStore(); 

    onMounted(()=>{
        flush();
        Mining.resFilters[Object.keys(Mining.resFilters)[1]].value = true;
    });

    const filteredGroups = computed(()=>{
        return Mining.resGroupFilters;

        console.log(props.data);
        console.log(Mining.resGroupFilters.map(e => e.columns));
        return [];
    })

    const flush = ()=>{
        Object.keys(Mining.resFilters).forEach(key => {
            Mining.resFilters[key].value = false;
        });
    }
    
</script>

<style lang="scss" scoped>
    .title{
        .btn{
            font-size: 14px
        }
    }

    .filters{
        @include flex-col;
        gap: 12px;
    }

    .filter-group{
        @include flex-col;
        gap: 12px;

        span{
            font-size: 16px;

            .unit{
                white-space: nowrap;
            }

            &::before, &::after{
                transform: translateY(2px);
            }
        }

        .group-title{
            color: var(--typo-secondary);
            padding: 10px 0;
            border-bottom: 1px solid var(--bg-border);
        }
    }
</style>