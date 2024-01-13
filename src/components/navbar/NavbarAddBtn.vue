<template>
    <div class="add-btn">
        <div class="item-content">
            <div class="ico-wr">
                <IPlus class="ico"/>
            </div>
            <div class="name">{{text}}</div>
        </div>
    </div>
</template>

<script setup>
    
    import IPlus from "@/components/icons/IPlus.vue";

    const props = defineProps({
        text: String,
    })

</script>

<style lang="scss" scoped>
    .add-btn{
        transition: .3s;
        cursor: pointer;
        padding: 0 12px;

        &:hover, &[active]{
            background: var(--bg-stripe);
        }

        &:active{
            transition: .01s;
            background: var(--bg-secondary);
        }

        .item-content{
            justify-content: start;
            align-items: center;
            gap: 10px;
            display: flex;
            height: 40px;
        }

        .item-content, .name{
            color: var(--typo-brand)
        }

        .name{
            @include text-overflow;
        }

        .ico-wr{
            height: 32px;
            width: 32px;
            margin: 0 -8px;
            @include flex-c;

            .ico{
                height: 12px;
                width: 12px;
            }
        }
    }
</style>