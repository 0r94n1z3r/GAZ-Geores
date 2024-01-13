<template>
    <div class="fluid-type">
        <h1>Тип флюида</h1>

        <div class="radios-wr">
            <label class="radio" v-if="!props.disabled || info.fluid_type == 'gas'"><input type="radio" value="gas" v-model="info.fluid_type"><span>Газ</span></label>
            <label class="radio" v-if="!props.disabled || info.fluid_type == 'oil'"><input type="radio" value="oil" v-model="info.fluid_type"><span>Нефть (в процессе разработки)</span></label>
        </div>
        
    </div>
</template>

<script setup>
    import { watch } from "vue";

    import { useProjectStore } from "@/stores/project.js";

    const proj = useProjectStore();

    const props = defineProps({
        info: Object,
        disabled: Boolean,
    });

    const emit = defineEmits(['update']);

    watch(()=>props.info.fluid_type, n =>emit('update', n))
</script>

<style lang="scss" scoped>
    

    h1{
        margin-bottom: 16px;
    }

    .radios-wr{
        @include flex-col;
        gap: 8px;

        .radio{
            width: max-content;

            span{
                font-size: 16px;

                &::before, &::after{
                    transform: translateY(3px);
                }
            }
        }
    }
</style>