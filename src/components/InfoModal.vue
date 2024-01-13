<template>
    <VModal 
        ref="modal" 
        :title="title" 
        class="info-modal"
    >
        <div class="content" v-if="$slots.default"> 
            <slot/>
        </div>
        <div class="bumper" v-else></div>
    </VModal>
</template>

<script setup>
    import { computed, ref } from 'vue';
    
    const props = defineProps({
        title: String
    })

//call
    const modal = ref(); 
    const call = ()=>{
        modal.value.call();
    }
    const close = ()=>{
        modal.value.close();
    }
    defineExpose({
        call,
        close
    });
</script>

<style lang="scss" scoped>
    .content{
        padding: 0 57px 25px;
    }

    .bumper{
        width: 100%;
        height: 16px;
    }
</style>