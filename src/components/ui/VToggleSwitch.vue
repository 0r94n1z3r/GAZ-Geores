<template>
    <div class="toggle-switch" @click="emit('update:modelValue', !modelValue)" :active="modelValue || null">
        <div class="dot"></div>
    </div>
</template>

<script setup>
    const props = defineProps({
        modelValue: Boolean
    }); 

    const emit = defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
    .toggle-switch{
        --width: 40px;
        --height: calc(var(--width) / 2);
        cursor: pointer;

        width: var(--width);
        height: var(--height);
        border: 1px solid var(--bg-control-primary);
        border-radius: var(--width);
        display: flex;
        align-items: center;
        padding: calc(var(--height) * .2 / 2);
        transition: .3s;

        .dot{
            width: calc(var(--height) * .80 - 2px);
            height: calc(var(--height) * .80 - 2px);
            border-radius: 50%;
            background: var(--bg-control-primary);
            transition: .3s;
        }

        &[active]{
            background: var(--bg-control-primary);

            .dot{
                margin-left: calc(100% - calc(var(--height) * .80 - 2px));
                background: var(--bg-default);
            }
        }
    }
</style>