<template>
    <div class="loader">
        <ILoader class="ico"/>
    </div>
</template>

<script setup>
    import ILoader from "@/components/icons/ILoader.vue"
</script>

<style lang="scss" scoped>
    

    .loader{
        @include flex-c;
        background: var(--bg-default); 
        color: var(--bg-control-primary);

        width: 65px;
        height: 65px;
        border-radius: 50%;

        &[inversed]{
            background: var(--bg-control-primary);
            color: var(--bg-default); 
        }

        &[hollow]{
            background: transparent;
        }

        .ico{
            width: 75%;
            height: 100%;
        }
    }
</style>