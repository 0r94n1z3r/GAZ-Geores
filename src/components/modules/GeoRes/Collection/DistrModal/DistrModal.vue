<template>
    <VModal 
        ref="modal" 

        :title="`${info.name}, ${info.units}`" 
        class="distr-modal"

        @close="closeHandler"
    >
        <!-- <PageNavigation
            :list="navList"
            class="nav"
        /> -->

        <div class="content">
            <Component 
                :is="
                    (page == 1 && (!distr.data || distr.data?.length != 1))?
                    DistrPick:
                    DistrFile
                " 
                :info="info"
                :type="type"
                ref="component"
            />
        </div>

        <div class="btns">
            <!-- <VButton 
                @click="
                    (page == 1 || distr.data?.length == 1)?
                    modal.close():
                    page = 1
                "
            >
                Далее
            </VButton> -->
            <!-- {{distr?.params_input?.map(e => [e.name, e.value])}} -->
            <VButton @click="modal.close()">Далее</VButton>
        </div>
        
    </VModal>
</template>

<script setup>
    import { computed, ref } from 'vue';

    import PageNavigation from '@/components/page/PageNavigation.vue';

    import DistrFile from'./DistrFile.vue';
    import DistrPick from'./DistrPick.vue';

    import { Distribution } from "@/script/distribution.js"

    import { useProjectStore } from "@/stores/project.js";
    import { useDistributionStore } from "@/stores/distribution.js";
    
    const content = computed(()=>useProjectStore().currentLevel?.content);

    const props = defineProps({
        info: Object,
        type: String,
    })

    const emit = defineEmits(['close', 'setDistribution'])

    const distr = computed(()=>content.value?.distribution_data?.columns?.[props.type]);

    const page = ref(0);

    const navList = computed(() => {
        let arr = [
            {
                title: 'Загрузка фактических значений',
                click: ()=>page.value = 0,
                active: ()=>page.value == 0
            },
        ]

        if(distr.value?.data?.length != 1){
            arr.push(
                {
                    title: 'Выбор распределения',
                    click: ()=>page.value = 1,
                    active: ()=>page.value == 1
                }
            )
        }

        return arr;
    });

    const component = ref();

    
const checkData = ()=>{
    component.value.checkData();
} 

//call
    const modal = ref(null); 
    const call = (pageIndex)=>{
        modal.value.call();
        page.value = pageIndex || 0;
        checkData();
    }
    const close = ()=>{
        modal.value.close();
        closeHandler();
    }
    defineExpose({
        call,
        close,
        checkData,
    });

    const closeHandler = ()=>{
        page.value = 0;

        if(distr.value?.data?.length != 1){
            if(!distr.value?.distribution){
                useDistributionStore().updateProps(content.value, props.type, 'sample');
            }

            emit(
                'setDistribution', 
                content.value.id,
                props.type,
                distr.value.distribution || 'sample',
                distr.value.params_input
            );
        }
    }
</script>

<style lang="scss" scoped>
    .distr-modal{
        :deep(.modal){
            width: 100%;
            max-width: 1060px;
        }
    }

    .nav{
        padding: 0 57px;
    }

    .content{
        padding: 32px 57px 25px;
    }
    
    .btns{
        padding: 0 57px 32px;
        display: flex;
        justify-content: end;
        gap: 21px;

        .btn{
            width: max-content;
            padding: 0 16px;
            height: 32px;
        }
    }
</style>