<template>
    <div class="text-select" :drop="drop || null" v-click-outside="checkValid">
        <VTextInput
            v-model="text" 
            @keydown="noBtn = false"
            @click="drop = true"
        >
            <div class="drop-ico" @click.stop="drop = !drop"><IDrop class="ico"/></div>
        </VTextInput>
        

        <div class="drop" v-if="displayList.length" :drop="drop || null">
            <div class="item" v-for="(i,k) in displayList" :key="k" @click="confirm(i)">{{keyName?i?.[keyName]:i}}</div>
        </div>
    </div>
</template>

<script setup>
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';
    import IDrop from '@/components/icons/IDrop.vue';

    import { computed, ref, watch } from "@vue/runtime-core";

    const props = defineProps({
        modelValue: Object,
        list: Array,
        keyName: String,
    })

    const emit = defineEmits(['update:modelValue', 'change']);

    const drop = ref(false);

    const noBtn = ref(true);

    watch(drop, ()=>setTimeout(()=>noBtn.value = true, 301));
    
    const text = ref(props.keyName?props.modelValue?.[props.keyName]:props.modelValue || '');
    watch(()=>props.modelValue, (n)=>text.value = props.keyName?n?.[props.keyName]:n || '');

    const displayList = computed(()=>{
        if(!props.modelValue || noBtn.value)return props.list;
        let list = props.list.filter(e =>(props.keyName?e?.[props.keyName]:e).toLowerCase().includes(text.value?.toLowerCase()));        
        return list;
    });

//finishers
    const checkValid = ()=>{
        if(!drop.value)return;

        let obj = displayList.value.find(e => (props.keyName?e?.[props.keyName]:e).toLowerCase() == text.value?.toLowerCase());
        confirm(obj);
    }

    const confirm = (obj)=>{
        text.value = (props.keyName ? obj?.[props.keyName] : obj) || '';
        emit('update:modelValue', obj);
        if((props.keyName?obj?.[props.keyName]:obj) != text.value )emit('change', obj);
        setTimeout(()=>drop.value = false);
    }

    
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .text-select{
        position: relative;

        .drop-ico{
            height: 100%;
            width: 30px;
            @include flex-c;
            color: var(--bg-border-focus);
            cursor: pointer;
            border-left: 1px solid var(--bg-border);

            .ico{
                transition: .3s;
            }
        }

        &[drop]{
            .drop-ico .ico{
                rotate: .5turn;
            }
        }

        // input{
        //     width: 100%;
        //     height: 100%;
        //     border: none;
        //     display: flex;
        //     border: 1px solid var(--bg-border);
        //     border-radius: ;
        // }

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

            .item{
                padding: 5px;
                cursor: pointer;
                word-break: break-word;
                text-align: left;

                &:hover{
                    background: #f5f5f5;
                }
            }

            &:not([drop]){
                @include hidden(-10px);
            }
        }

        &[rev]{
            .drop{
                top: unset;
                bottom: 100%;
                border-radius: 5px 5px 0 0;

                &:not([drop]){
                    @include hidden(10px);
                }
            }
        }

        &[locked]{
            background: var(--bg-ghost);
            pointer-events: none;
        }
    }
</style>