<template>
    <VTextInput 
        :big="big || null"
        v-model="text" 
        :type="eye?'text':'password'"
        :placeholder="placeholder"
        :err="err"
        ref="inp"
        @focus="emit('focus')"
    >
        <div class="eye" @click="eye = !eye" :active="eye || null">
            <IEye class="ico"/>
        </div>
    </VTextInput>
</template>

<script setup>
    import IEye from '@/components/icons/IEye.vue';
    import { ref, watch } from 'vue';

    const props = defineProps({
        big: Boolean,
        modelValue: [String, Number],
        placeholder: String,
        err: String,
    });

    const emit = defineEmits(['update:modelValue', 'focus']);

//eye
    const eye = ref(false);

//text
    const text = ref('');
    watch(text, (n)=>emit('update:modelValue', n));
    watch(()=>props.modelValue, (n)=>text.value = n);

//focus
    const inp = ref(null);

    const focus = ()=>{
        inp.value.focus();
    }

    defineExpose({focus});
</script>

<style lang="scss" scoped>
    

    .eye{
        height: 100%;
        width: 30px;

        @include flex-c;

        cursor: pointer;

        .ico{
            transition: .3s;
            color: var(--typo-ghost);   
        }

        &[active]{
            .ico{
                color: var(--bg-border);
            }
        }

        &:hover{
            .ico{
                color: var(--typo-secondary);
            }
        }        
    }

    [big]{
        .eye{
            width: 46px;
        }
    }
</style>