<template>
    <div>
        <VTextInput v-model="val" @blur="submit" ref="inp" @keydown.enter="inp.blur()" :err="err" err-absolute>
            <div v-if="!noModal" class="caller" @click.stop="emit('callModal')"><IDownload class="ico"/></div>
        </VTextInput>
    </div>
</template>

<script setup>
    import IDownload from "@/components/icons/IDownload.vue";

    import { computed, onMounted, ref, watch } from "vue";

    import { useDistributionStore } from "@/stores/distribution.js";
    import { Distribution } from "@/script/distribution.js";

    import { useProjectStore } from "@/stores/project.js";
    const content = computed(()=>useProjectStore().currentLevel?.content);

    const props = defineProps({
        type: String,
        noModal: Boolean
    })

    const emit = defineEmits(['callModal', 'setDistribution']);

    const distr = computed(()=>content.value?.distribution_data?.columns?.[props.type]);

    const inp = ref();

    const data = computed(()=>distr?.value?.data || []);

    const val = ref('');

    const mounted = ref(false);

    const err = ref('')

    watch(()=>[...data.value, mounted.value], n => {
        val.value = data.value.join('; ');
    });

    onMounted(()=>{
        setTimeout(()=>{
            if(!content.value.distribution_data)content.value.distribution_data = {};
            if(!content.value.distribution_data.columns)content.value.distribution_data.columns = {};
            if(!content.value.distribution_data.columns[props.type])content.value.distribution_data.columns[props.type] = {};
            mounted.value = true;
        },400);
    })

    const submit = ()=>{
        err.value = '';
        let dt = val.value.replaceAll(',', '.').split(/;| |\//).filter(e => e !== '').map(e => parseFloat(e));

        // if(dt.length < 2){
        //     console.log('+');
        //     err.value = '';
        //     setTimeout(()=>{err.value = 'Длина должна быть больше 1';});
        //     return;
        // }
        
        //if(JSON.stringify(dt) == JSON.stringify(distr.value.data) || !dt.length)return;
        
        if(!dt.length){
            Distribution.data.delete(
                content.value.id,
                props.type,
                res => {
                    distr.value.data = null;
                    distr.value.distribution = null;
                },
                error => {
                    if(error.includes('Нет данных для колонки'))return;
                    err.value = error?.[props.type] || error?.data || error
                }
            );
            return;
        }

        // if(!distr.value.data)distr.value.data = [];

        distr.value.data = dt;
        
        Distribution.data.set(
            content.value.id, 
            props.type, 
            data.value,
            ()=>{
                useDistributionStore().updateProps(content.value, props.type, 'sample')

                if(dt.length > 1){
                    emit(
                        'setDistribution', 
                        content.value.id,
                        props.type,
                        distr.value.distribution,
                        [] //distr.value.params_input || []
                    );
                }
            },
            error => {
                err.value = error?.[props.type] || error?.data || error
            }
        );
    }

</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .caller{
        height: 100%;
        width: 31px;
        @include flex-c;
        border-left: 1px solid var(--bg-border);
        cursor: pointer;

        .ico{
            width: 50%;
            height: 100%;
            color: var(--typo-secondary);
        }
    }
</style>