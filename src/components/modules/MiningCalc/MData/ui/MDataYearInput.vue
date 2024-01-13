<template>
    <div class="data-inputs year-inputs" v-if="value.p50 != null">
        <div class="m-data-input">
            <div class="title-wr">
                <p :style="{height: yDrop?'32px':'auto'}">{{title}}</p>
                <div class="control" :blank="!yDrop || null" @click="yDrop = !yDrop">
                    <IDropArr :style="{transform: `rotate(${yDrop?.5+'turn':0})`}" class="ico"/>
                </div>
                <div class="control" v-if="!single" :blank="!multiPerc || null" @click="multiPerc = !multiPerc">
                    <IPlus class="ico" v-if="!multiPerc"/>
                    <IMinus class="ico" v-else/>
                </div>
                <div class="err" v-if="error">{{error}}</div>
            </div>
            <div class="inputs" :blush="error || null" :loading="loading || null" v-if="value">
                <ILoader v-show="loading" class="loader"/>
                <div class="inp-wr"><div class="locked">{{Proj.activeProject?.mining_start_year}}</div></div>
                <div class="inp-wr" v-if="multiPerc && !single">
                    <VTextInput blurOnly type="number" @update="zeroUpdate" :borders="borders" err-absolute v-model="value.p90[0]" v-if="!locked" htmlPlaceholder="P<span class='sub'>90</span>"/>
                    <div class="locked" v-else>{{value?.p90[0] != null ? ( roundTo != null?round(parseFloat(value?.p90[0]), roundTo) : value?.p90?.[0] ) : ''}}</div>
                </div>
                <div class="inp-wr">
                    <VTextInput blurOnly type="number" @update="zeroUpdate" :borders="borders" err-absolute v-model="value.p50[0]" v-if="!locked" htmlPlaceholder="P<span class='sub'>50</span>"/>
                    <div class="locked" v-else>{{value?.p50[0] != null ? ( roundTo != null?round(parseFloat(value?.p50[0]), roundTo) : value?.p50?.[0] ) : ''}}</div>
                </div>
                <div class="inp-wr" v-if="multiPerc && !single">
                    <VTextInput blurOnly type="number" @update="zeroUpdate" :borders="borders" err-absolute v-model="value.p10[0]" v-if="!locked" htmlPlaceholder="P<span class='sub'>10</span>"/>
                    <div class="locked" v-else>{{value?.p10[0] != null ? ( roundTo != null?round(parseFloat(value?.p10[0]), roundTo) : value?.p10?.[0] ) : ''}}</div>
                </div>
            </div>
            <VButton hollow class="copy-btn" @click="setToAll({p90: value.p90[0], p50: value.p50[0], p10: value.p10[0]})">Дублировать по годам</VButton>
        </div>

        <MDataInput 
            v-for="(i,k) in value.p50.length-1"
            :key="k"
            :value="{p90: value.p90[i], p50: value.p50[i], p10: value.p10[i]}"
            :showPercs="multiPerc?['p90', 'p50', 'p10']:['p50']"
            :year="Proj.activeProject?.mining_start_year+i"
            v-show="yDrop"
            @update="updateValue(i, $event)"

            :locked="locked || null"
            
            :borders="borders"

            :error-blush="!!error"

            :loading="loading"
        />
    </div>
</template>

<script setup>
    import IPlus from "@/components/icons/IPlus.vue";
    import IMinus from "@/components/icons/IMinus.vue";
    import ILoader from "@/components/icons/ILoader.vue";

    import IDropArr from "@/components/icons/IDropArr.vue";

    import MDataInput from "@/components/modules/MiningCalc/MData/ui/MDataInput.vue"

    import Mining from "@/stores/mining.js";
    
    import { useProjectStore } from "@/stores/project.js"
    
    import { computed, ref } from "vue";

    const props = defineProps({
        title: String,
        value: Object,
        single: Boolean,
        error: [String, Array],
        borders: String,
        locked: Boolean,
        loading: Boolean,
    });

    const emit = defineEmits(['update']);

    const Proj = useProjectStore();

    let updateCooldownTimeout = null;
    let updateCooldown = false;
    const updateValue = (id, val)=>{
        if(updateCooldown)return;

        if(updateCooldownTimeout)clearTimeout(updateCooldown);
        updateCooldown = true;
        updateCooldownTimeout = setTimeout(()=>{updateCooldown = false}, 100);

        props.value.p90[id] = val.p90;
        props.value.p50[id] = val.p50;
        props.value.p10[id] = val.p10;

        emit('update', props.value);
    }

    const zeroUpdate = ()=>{
        let v = props.value;

        // if(v.p10[0] == null)v.p10[0] = v.p50[0] || v.p90[0]; 
        // if(v.p90[0] == null)v.p90[0] = v.p50[0] || v.p10[0]; 
        // if(v.p50[0] == null)v.p50[0] = v.p90[0] || v.p10[0]; 

        if(!multiPerc.value){
            v.p10 = JSON.parse(JSON.stringify(v.p50));
            v.p90 = JSON.parse(JSON.stringify(v.p50));
        }

        emit('update', v);

        ['p10', 'p50', 'p90'].forEach(key=>{
            for (var i=1; i<props.value[key].length; i++){
                props.value[key][i] = props.value[key][i] || 0
            }
        })
    };

    const setToAll = (val)=>{
        Object.keys(val).forEach(key=>{
            for (var i=0; i<props.value[key].length; i++) props.value[key][i] = val[key]
        })

        emit('update', props.value);
    }

    //year
        const multiPerc = ref(false);
        const yDrop = ref(false);
</script>

<style lang="scss" scoped>
    .title-wr{
        position: relative;
        
        .err{
            position: absolute;
            top: 100%;
            left: 0;
            color: var(--typo-alert);
            transform: translateY(-9px);
        }
    }

    .year-inputs{
        gap: 0!important;
        // overflow: hidden;
        margin-bottom: 28px;

        .copy-btn{
            height: 32px;
            width: max-content;
            padding: 0 14px;
            font-size: 14px;
        }
    }

    .inputs[blush]{
        .inp-wr{
            border-color: var(--typo-alert);
        }
    }

    
</style>