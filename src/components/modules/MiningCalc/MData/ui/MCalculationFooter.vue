<template>
    <div class="footer-container">
        <p class="err" v-if="error">{{error}}</p>
        <VButton
            :disabled="!Mining.activeGroup?.has_all_data || null"
            @click="calculate"
            :loading="loading || null"
        >
            Выполнить оценку
        </VButton>   
    </div>
</template>

<script setup>
    import MiningStore from "@/stores/mining.js";
    import RouterControl from "@/stores/routerControl.js";

    import mAPI from "@/script/mining.js";
    import { ref } from "vue";
    
    const Mining =  MiningStore();
    const R = RouterControl();

    const error = ref('')
    const loading = ref(false)



    

    const calculate = ()=>{
        error.value = '';
        loading.value = true;

        Mining.calculateResults(
            Mining.activeGroup,
            ()=>{
                R.setMiningRoute(
                    R.route.meta?.mode,
                    1,
                    R.route.params.projId,
                    Mining.activeGroup.id,
                )
            },
            err => {
                loading.value = false;
                error.value = err
            }
        )
    }
</script>

<style lang="scss" scoped>
    .footer-container{
        display: flex;
        gap: 12px;

        .err{
            height: 32px;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: var(--typo-alert);
        }
        
        .btn{
            height: 32px;
            width: max-content;
            padding: 0 16px 1px;
            font-size: 14px;
        }
    }
</style>