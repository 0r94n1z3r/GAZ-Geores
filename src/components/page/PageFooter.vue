<template>
    <div class="page-footer">
        <div class="wr">
            <slot/>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .page-footer{
        background: var(--bg-default);
        width: calc(100% + 38px);
        
        height: 60px;

        position: sticky;
        left: 0;
        bottom: 0;
        margin-left: -19px;
        margin-top: 19px;
        
        .wr{
            height: 100%;
            width: 100%;
            position: relative;

            @include flex-jtf;
            align-items: center;
            
            padding: 0 24px;

            &::after{
                @include pseudo-absolute;
                width: 100%;
                bottom: 100%;
                left: 0;
                height: 8px;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.04) 100%);
                pointer-events: none;
            }
        }

        &[reversed]{
            .wr{
                flex-direction: row-reverse;
            }
        }
    }
</style>