<template>
    <div 
        class="select-wr" 
        :drop="drop || null"
        v-click-outside="()=>{drop = false}"
    >
        <div class="title" @click="drop = !drop" v-if="!isloading">
            <div class="text">
                <div class="content">
                    {{keyName?modelValue?.[keyName]:modelValue}}
                </div>
            </div>
            <div class="arrow"><IDrop class="ico"/></div>
        </div>
        <div class="title" @click="drop = true" v-else>
            <div class="content">
                <div class="text">Загрузка...</div>
            </div>
        </div>

        <div class="drop shadow-block" v-if="list?.length && modelValue">
            <div v-for="i,k in list" :key="k" class="option" @click="select(i)">
                {{keyName?i[keyName]:i}}
                <span v-if="i[extraKey]">{{i[extraKey]}}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import IDrop from '@/components/icons/IDrop.vue';

    const props = defineProps({
        list: Array,
        modelValue: [Object, String],
        keyName: String,
        extraKey: String,
        loading: Boolean
    })

    const emit = defineEmits(['update:modelValue']);

    const drop = ref(false);

    const select = (obj)=>{
        emit('update:modelValue',obj);
        drop.value = false;
    }

    const isloading = computed(()=>props.loading || !props.modelValue);

</script>

<style lang="scss" scoped>
    

    .select-wr{
        --brd-color: var(--bg-border);

        &:not([drop]){
            .drop{
                @include hidden(-10px);
            }     
        }

        &[drop]{
            .title{
                .arrow{
                    .ico{
                        transform: rotate(.5turn);
                    }
                }
            }
        }

        position: relative;
        height: 32px;
        width: 100%;
        border: 1px solid var(--brd-color);
        border-radius: 4px;
        cursor: pointer;
        min-width: 0;

        .title, .drop{
            width: 100%;
            justify-content: space-between;
            background: var(--bg-default);
        }

        .title{
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            border-radius: 3px;

            .text{
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 12px;
                overflow: hidden;;

                .content{
                    @include text-overflow;
                }
            }

            .arrow{
                @include flex-c;
                height: 100%;
                width: 31px;
                border-left: 1px solid var(--brd-color);
                color: var(--brd-color);
                flex-shrink: 0;

                .ico{
                    transition: .3s;
                }
            }
        }

        .drop{
            position: absolute;
            top: calc(100% + 6px);

            border-radius: 4px;
            border: 1px solid var(--brd-color);

            transition: .3s;

            z-index: 5;

            max-height: 30vh;
            overflow-y: auto;

            width: calc(100% + 2px);
            margin-left: -1px;

            .option{
                @include flex-col;
                justify-content: center;
                padding: 5px 12px;
                transition: .3s;

                flex-wrap: wrap;
                gap: 2px;

                span{
                    color: var(--typo-secondary);
                }

                &:not(:last-child){
                    border-bottom: 1px solid var(--brd-color);
                }

                &:hover{
                    background: var(--bg-ghost);
                }
            }
        }
    }

    
</style>