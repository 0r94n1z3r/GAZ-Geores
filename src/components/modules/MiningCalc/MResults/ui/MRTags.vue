<template>
    <div class="tags">
        <div class="tags-input" :drop="drop || null" v-click-outside="()=>{drop = false}">
            <div class="tags-container" @click="drop = true">
                <div class="tag" v-for="i in selectedValues" :key="i.name">
                    {{i.name}}
                    <div class="close" @click.stop="setValues(i.verbose_name, false)"><ICross class="ico"/></div>
                </div>
            </div>
            <div class="action-ico" @click="flushValues"><ICross class="ico"/></div>
            <div class="drop-ico-container" @click="drop = !drop">
                <div class="action-ico drop-ico"><IDrop class="ico"/></div>
            </div>
            <div class="drop checkboxes">
                <label class="checkbox" v-for="(i,k) in values" :key="k">
                    <input type="checkbox" v-model="i.value" @change="setValues(i.verbose_name, i.value)">
                    <span>{{i.name}}</span>
                </label>
            </div>
        </div>
        <div class="modes-List checkboxes">
            <label class="checkbox" v-for="(i,k) in modes" :key="k">
                <input type="checkbox" v-model="i.value" @change="setMode(i.name, i.value)">
                <span>{{i.name}}</span>
            </label>
        </div>

        <!-- _________
        <div class="tags-List">
            <label  class="checkbox" v-for="(i,k) in info.columns" :key="k">
                <input type="checkbox" v-model="i.value">
                <span>{{i?.verbose_name}}{{i?.units && `, `}}<span v-if="i?.units" class="unit">{{i?.units}}</span></span>
            </label>
        </div> -->
    </div>
</template>

<script setup>
    import ICross from "@/components/icons/ICross.vue";
    import IDrop from "@/components/icons/IDrop.vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import { computed, ref } from "vue";

    const props = defineProps({
        info: Object
    });

//drop
    let drop = ref(false);

//values
    const values = computed(()=>{
        let cols = Object.values(props.info.columns);

        let res = cols.reduce((acc, e)=>{
            let name = e.verbose_name.split(' ').slice(2).join(' ');

            let obj = acc.find(o => o.verbose_name == name);

            if(!obj){
                acc.push({
                    name: (name.charAt(0).toUpperCase() + name.slice(1)).replace(/ого /g, "ый ").replace(/а$/g, ""),
                    verbose_name: name,
                    value: cols.filter(o => o.verbose_name.split(' ').slice(2).join(' ') === name).some(o => o.value),
                    objs: [e]
                })
            }else{
                obj.objs.push(e);
            }

            return acc;
        }, [])

        if(!selectedValues.value && res.length)selectedValues.value = [res[0]];

        return res;
    })

    const selectedValues = ref();

    const setValues = (name, val)=>{
        selectedModes.value.forEach(e => 
            e.objs.find(o => o.verbose_name.split(' ').slice(2).join(' ') === name).value = val
        );

        selectedValues.value = values.value.filter(e => e.value);//notdone
    }

    const flushValues = ()=>{
        Object.values(props.info.columns).forEach(e=>e.value = false);
        selectedValues.value = [];
    }

//modes
    const modes = computed(()=>{
        let cols = Object.values(props.info.columns);

        let res = cols.reduce((acc, e)=>{
            let name = e.verbose_name.split(' ').slice(0,2).join(' ');

            let obj = acc.find(o => o.verbose_name == name);

            if(!acc.some(o => o.name.includes(name))){
                acc.push({
                    name,
                    verbose_name: name,
                    value: cols.filter(o => o.verbose_name.includes(name)).some(o => o.value),
                    objs: [e]
                })
            }else{
                obj.objs.push(e);
            }

            return acc;
        }, [])

        if(!selectedModes.value && res.length)selectedModes.value =[res[0]];

        return res;
    })

    const selectedModes = ref();

    const setMode = (name, val)=>{
        selectedValues.value.forEach(e => 
            e.objs.find(o => o.verbose_name.includes(name)).value = val
        )

        selectedModes.value = modes.value.filter(e => e.value);//notdone
    }

    
</script>

<style lang="scss" scoped>
    .checkboxes{
        @include flex-col;
        gap: 12px;
    }

    .checkbox{
        span{
            font-size: 16px;

            .unit{
                white-space: nowrap;
            }

            &::before, &::after{
                transform: translateY(2px);
            }
        }
    }

    .tags-input {
        position: relative;
        width: 100%;
        border: 1px solid var(--bg-border);
        border-radius: 4px;
        display: flex;
        margin-bottom: 12px;
        

        .tags-container{
            padding: 5px 9px;
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            width: 100%;
            cursor: text;
        }

        .drop{
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
        }

        .action-ico{
            height: 100%;
            height: 33px;
            width: 32px;
            flex-shrink: 0;
            @include flex-c;
            color: var(--bg-border-focus);
            cursor: pointer;

            .ico{
                transition: .3s;
            }
        }

        .drop-ico-container{
            border-left: 1px solid var(--bg-border);
        }

        &[drop]{
            .drop-ico .ico{
                rotate: .5turn;
            }
        }

        .drop{
            position: absolute;
            left: 0;
            top: 100%;
            background: var(--bg-default);
            padding: 1px 0;
            width: 100%;
            border-radius: 0 0 5px 5px;
            box-shadow: (0 0 5px #00000040);
            max-height: 40vh;
            overflow-y: auto;
            z-index: 5;
            transition: .3s;

            @include flex-col;
            gap: 2px;
            padding: 4px 8px;
        }

        &:not([drop]) .drop{
            @include hidden(-10px);
        }
    }
</style>