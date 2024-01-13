<template>
    <div class="page-content-wr">
        

        <div class="content">
            <slot/>
        </div>
        

        <PageFooter class="footer" :hide="hideFooter || null" :reversed="reversed || null">
            <slot name="footer"/>
        </PageFooter>
    </div>
</template>

<script setup>
    import PageFooter from "@/components/page/PageFooter.vue";

    const props = defineProps({
        reversed: Boolean,
        hideFooter: Boolean
    });
</script>

<style lang="scss" scoped>
    

    .page-content-wr{
        @include flex-col;
        .content{
            flex-grow: 1;
        }
    }

    .footer{
        flex-shrink: 0;
        transition: .3s;

        &[hide]{
            @include hidden(0px);
        }
    }
</style>