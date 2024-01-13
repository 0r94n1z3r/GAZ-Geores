<template>
    <LayFooterPage reversed :hideFooter="Mining.activeGroup.up_to_date_calculation">
        <h1>1. Формирование геологических сценариев</h1>
        <p class="comment">Пользователь может использовать данные, полученные по результатам работы в модуле вероятностной оценки запасов или использовать собственные значения параметров для одного или трех геологических сценариев</p>

        <div class="loading-wr" v-if="data == null"><VLoading/></div>

        <template v-else>
            <div class="sync-wr" v-if="Mining.activeObject.layers.length">
                <VButton @click="syncLayers()" hollow fit :loading="syncLoading || null">Заполнить на основании залежей</VButton>
                <p err v-if="syncErr">{{syncErr}}</p>
            </div>

            <div class="data-inputs">
                <div class="m-data-input">
                    <div class="title-wr">
                        <p>Геологические сценарии</p>
                        <div class="control" :blank="!multiPerc || null" @click="multiPerc = !multiPerc">
                            <IPlus class="ico" v-if="!multiPerc"/>
                            <IMinus class="ico" v-else/>
                        </div>
                    </div>
                    <div class="inputs"> 
                        <div class="inp-wr" v-if="multiPerc"><div class="locked"><span>P<span class="sub">90</span></span></div></div>
                        <div class="inp-wr"><div class="locked"><span>P<span class="sub">50</span></span></div></div>
                        <div class="inp-wr" v-if="multiPerc"><div class="locked"><span>P<span class="sub">10</span></span></div></div>
                    </div>
                </div>

                <MDataInput 
                    v-for="(i,k) in data.moved_calculated_data"
                    :key="k"
                    :showPercs="multiPerc?['p90', 'p50', 'p10']:['p50']"
                    :title="`${i.verbose_name}, ${i.units}`"
                    :value="i.value"
                    :round-to="i.round_to"
                    locked
                />

                <MDataInput 
                    v-for="(i,k) in data.moved_input_data" 
                    :key="k"
                    :showPercs="multiPerc?['p90', 'p50', 'p10']:['p50']"
                    :title="`${i.verbose_name}, ${i.units}`"
                    :value="i.value"
                    :round-to="i.round_to"

                    :error="i.err"
                    @update="(e)=>{upload(k, e)}"

                    :borders="getBorders(
                        i.minval_closed,
                        i.minval,
                        i.maxval,
                        i.maxval_closed
                    )"

                    :loading="i.loading"
                />
            </div>
        </template>

        <template #footer>
            <MCalculationFooter/>
        </template>
    </LayFooterPage>
</template>

<script setup>
    import { onMounted, ref, watch } from "vue";

    import { getBorders } from "@/helpers/borders.js";

    import IPlus from "@/components/icons/IPlus.vue";
    import IMinus from "@/components/icons/IMinus.vue";
    
    import LayFooterPage from "@/components/layouts/LayFooterPage.vue";

    import MDataInput from "@/components/modules/MiningCalc/MData/ui/MDataInput.vue"
    import MCalculationFooter from "@/components/modules/MiningCalc/MData/ui/MCalculationFooter.vue"

    import MiningStore from "@/stores/mining.js";
    import mAPI from "@/script/mining.js";

    import { useRoute } from "vue-router";

    const props = defineProps({
        data: Object
    })
    
    const route = useRoute();

    const Mining =  MiningStore();

    const multiPerc = ref(true);

//upload
    const holdUpload = ref(false);
    const HUTimer = ref(null);

    const updateValues = (resp, key)=>{
        Object.keys(resp[key]).forEach(k => {
            props.data[key][k].value = 
                props.data[key][k].array?
                resp[key][k]:
                {p90: resp[key][k].p90[0], p50: resp[key][k].p50[0], p10: resp[key][k].p10[0]}
        })

        if(HUTimer.value)clearTimeout(HUTimer.value);
        HUTimer.value = setTimeout(()=>{holdUpload.value = false}, 1000);
    }

    const upload = (col, dataToSend)=>{
        if(holdUpload.value)return;
        // Mining.activeGroup.up_to_date_calculation = false; 
        props.data.moved_input_data[col].err = '';
        props.data.moved_input_data[col].loading = true;


        mAPI.object().data.set(
            route.params.objectId,
            col,
            'moved_input',
            dataToSend,
            res=>{
                updateValues(res, 'moved_calculated_data');
                Mining.refreshStatus(route.params.groupId);
                props.data.moved_input_data[col].loading = false;
            }, 
            err=>{
                console.log(err);
                props.data.moved_input_data[col].err = Object.entries(Object.entries(err)?.[0]?.[1] || {})?.[0]?.[1] || err
                props.data.moved_input_data[col].loading = false;
            }
        )
    }

//sync
    const syncLoading = ref(false);
    const syncErr = ref('');

    const syncedData = ref(null);

    const syncLayers = ()=>{
        syncLoading.value = true;
        syncErr.value = "";

        mAPI.object().syncFromLayers(
            route.params.objectId,
            res=>{              
                updateValues(res, 'moved_calculated_data');
                updateValues(res, 'moved_input_data');
                syncLoading.value = false;
            },
            err=>{
                syncErr.value = err;
                syncLoading.value = false;
            }
        )
    }

</script>

<style lang="scss" scoped>
    h1{
        margin-bottom: 7px;
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

    .sync-wr{
        margin-bottom: 20px;
    }

    p[err]{
        color: var(--typo-alert);
        margin-top: 10px;
        font-size: 14px;
    }
</style>