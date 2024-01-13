<template>
    <LayFooterPage reversed :hideFooter="Mining.activeGroup.up_to_date_calculation">
        <h1>Исходные данные</h1>
        <p class="comment">Для выполнения оценки профилей добычи необходимо заполнить исходную информацию как по группе объектов разработки, так и по каждому объекту разработки в данной группе</p>
        <div class="loading-wr" v-if="data == null"><VLoading/></div>
        <template v-else>
            <div class="data-inputs" v-for="(fs,f) in Mining.defaultValues.group_calculation_input_fieldsets" :key="f">
                <h1>{{fs.verbose_name}}</h1>
                <template v-for="(col,k) in fs.columns">
                    <MSwitchInput
                        v-if="data.input_data[col]?.boolean"
                        :reversed="['14.33'].includes(col)"
                        :key="'i'+col"
                        :title="`${data.input_data[col]?.verbose_name}${data.input_data[col]?.units && `, ${data.input_data[col]?.units}`}`"
                        :value="data.input_data[col]?.value"
                        :error="data.input_data[col]?.err"
                        @update="(e)=>{upload(col, e)}"
                        :loading="data.input_data[col]?.loading"
                    />
                    <MDataYearInput 
                        v-else-if="data.input_data[col]?.array"
                        :key="k"
                        :title="`${data.input_data[col]?.verbose_name}${data.input_data[col]?.units && `, ${data.input_data[col]?.units}`}`"
                        :value="data.input_data[col]?.value"
                        :error="data.input_data[col]?.err"
                        @update="(e)=>{upload(col, e)}"
                        :borders="getBorders(
                            data.input_data[col]?.minval_closed,
                            data.input_data[col]?.minval,
                            data.input_data[col]?.maxval,
                            data.input_data[col]?.maxval_closed
                        )"
                        single
                        :loading="data.input_data[col]?.loading"
                    />
                    <MDataInput 
                        v-else
                        :key="col"
                        :showPercs="['p50']"
                        :title="`${data.input_data[col]?.verbose_name}${data.input_data[col]?.units && `, ${data.input_data[col]?.units}`}`"
                        :value="data.input_data[col]?.value"
                        :error="data.input_data[col]?.err"
                        @update="(e)=>{upload(col, e)}"
                        :borders="getBorders(
                            data.input_data[col]?.minval_closed,
                            data.input_data[col]?.minval,
                            data.input_data[col]?.maxval,
                            data.input_data[col]?.maxval_closed
                        )"
                        :loading="data.input_data[col]?.loading"
                    />
                </template>
            </div>
        </template>
        

        <template #footer>
            <MCalculationFooter/>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import { getBorders } from "@/helpers/borders.js";

    import IPlus from "@/components/icons/IPlus.vue";
    import IMinus from "@/components/icons/IMinus.vue";
    
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import MDataInput from "@/components/modules/MiningCalc/MData/ui/MDataInput.vue"
    import MDataYearInput from "@/components/modules/MiningCalc/MData/ui/MDataYearInput.vue"
    import MCalculationFooter from "@/components/modules/MiningCalc/MData/ui/MCalculationFooter.vue"
    import MSwitchInput from "@/components/modules/MiningCalc/MData/ui/MSwitchInput.vue"

    import MiningStore from "@/stores/mining.js";
    import mAPI from "@/script/mining.js";

    import { useRoute } from "vue-router";
    
    const route = useRoute();

    const Mining =  MiningStore();

    const props = defineProps({
        data: Object 
    });

//upload
    const upload = (col, dataToSend)=>{
        // Mining.activeGroup.up_to_date_calculation = false;
        props.data.input_data[col].err = '';
        props.data.input_data[col].loading = true;

        mAPI.group().data.set(
            route.params.groupId,
            col,
            'calculation_input',
            dataToSend,
            ()=>{
                Mining.refreshStatus(route.params.groupId);
                props.data.input_data[col].loading = false;
            }, 
            err=>{
                console.log(err);
                props.data.input_data[col].err = Object.entries(Object.entries(err)?.[0]?.[1] || {})?.[0]?.[1] || err
                props.data.input_data[col].loading = false;
            }
        )
    }
</script>

<style lang="scss" scoped>
    h1{
        margin-bottom: 10px;
    }

    .comment{
        color: var(--typo-secondary);
        font-size: 12px;
        max-width:  700px;
        margin-bottom: 27px;
    }

    .data-inputs{
        margin-bottom: 27px;
        @include flex-col;
        gap: 20px;
    }
</style>
