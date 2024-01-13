<template>
    <div class="consts" v-if="Object.keys(list)">
        <div class="const" v-for="(i,k) in list" :key="k" :drop="i.drop || null">
            <div class="title">
                <h1>{{i.verbose_name}}</h1>
                <div class="info-caller" v-if="k == 'gcos'" @click="gCosInfoModal.call()">
                    <IInfo class="ico"/>
                </div>
            </div>
            <div class="val">
                <VTextInput 
                    v-model="i.value" 
                    :ref="e => i.ref = e"

                    type="number"
                    class="inp"

                    :err="i.err"

                    @blur="setConstant(k,i)"
                    @keydown.enter="i.ref.blur()"

                    :borders="`[${i.minval};${i.maxval}]`"
                />
                <div 
                    class="drop" 
                    @click="i.drop = !i.drop"
                    v-if="Object.keys(i.list).length"
                >
                    <IDropArr/>
                </div>
            </div>
            <div class="list" :style="{height: i.drop?(36 * Object.keys(i.list).length + 3) + 'px':0}">
                <div class="item" v-for="(j,f) in i.list" :key="f">
                    <div class="item-title">{{j.verbose_name}}, {{j.units}}</div>
                    <VTextInput 
                        v-model="j.value"
                        :ref="e => j.ref = e" 

                        type="number"
                        class="inp"

                        :err="j.err"

                        @keydown.enter="j.ref.blur()"
                        @change="recalcVal(i,k)"

                        :borders="`[${j.minval};${j.maxval}]`"
                    />
                </div>
            </div>
            
        </div>
        <GCosInfoModal ref="gCosInfoModal"/>
    </div>
</template>

<script setup>
    import GCosInfoModal from '@/components/modules/GeoRes/Collection/GCosInfoModal.vue';
    import IDropArr from "@/components/icons/IDropArr.vue";

    import { useDistributionStore } from "@/stores/distribution.js";
    import { useProjectStore } from "@/stores/project.js";

    import { onMounted, ref, watch } from "vue";

    import { Distribution } from "@/script/distribution.js";

    const props = defineProps({
        info: Object
    });

    const Distr = useDistributionStore();
    const Project = useProjectStore();

    const list = ref([]);

    const updateList = ()=>{
        // console.log(props.info.input_constants)

        list.value = [];

        if(!Distr.columns?.input_constants?.[props.info?.fluid_type])return;

        let res = JSON.parse(JSON.stringify(Distr.columns.input_constants[props.info.fluid_type]));

        for(let k in res){
            res[k].value = props.info.input_constants[k];

            if(res[k].value == null){
                res[k].value = 1;
                props.info.input_constants[k] = 1;
                setConstant(k, {value: 1})
            }

            res[k].list = JSON.parse(JSON.stringify(Distr.columns.input_constants_components[props.info?.fluid_type][k]));
            
            let comps = props?.info?.input_constants_components?.[k]
            Object.keys(res[k].list).forEach((kl, i)=>{
                res[k].list[kl].value = comps?.[kl] != null?comps[kl]:(!comps && i==0?res[k].value:1);
            })
        }
        
        list.value = res;
    }

    onMounted(()=>setTimeout(updateList, 200));
    watch(()=>props.info.id, updateList);
    watch(()=>Distr.columns, updateList);
    watch(()=>props.info.fluid_type, updateList);

//recalcVal
    const recalcVal = (e, name) => {
        // let res = 1; 
        let resObj = {}

        for (let k in e.list){
            if(e.list[k].value<e.list[k].minval || e.list[k].value>e.list[k].maxval)return;
            // res *= e.list[k].value;
            resObj[k] = e.list[k].value;
        }

        // e.value = res;

        Project.currentLevel.content.up_to_date_simulation = false;

        Distribution.constant.set_with_components(
            props.info.id, 
            name,
            resObj,
            res => e.value = res.value
        );
    }
    

//back
    const setConstant = (name, item)=>{
        if(item.value == '')return;

        Object.keys(item?.list || {}).forEach((kl, i)=>{
            item.list[kl].value = i?1:item.value;
        })

        Project.currentLevel.content.up_to_date_simulation = false;

        if(props.info?.input_constants?.[name])props.info.input_constants[name] = item.value;
        Distribution.constant.set(props.info.id, name, item.value);
    }

//modal
    const gCosInfoModal = ref();
    
</script>

<style lang="scss" scoped>
    .consts{
        .const{
            .title{
                display: flex;
                margin-bottom: 16px;
                align-items: baseline;

                .info-caller{
                    height: 1.4em;
                    width: 1.4em;
                    @include flex-c;
                    cursor: pointer;
                    color: var(--bg-shadow);

                    .ico{
                        width: 55%;
                        height: 55%;
                    }
                }
            }
            

            .val{
                display: flex;
                gap: 8px;

                .inp{
                    width: 200px;
                }

                .btn{
                    height: 32px;
                    width: max-content;
                    padding: 0 16px;
                    padding-bottom: 1px;
                }

                .drop{
                    height: 32px;
                    width: 32px;
                    @include flex-c;
                    transition: .3s;
                    cursor: pointer;
                    margin-left: -8px
                }
            }

            .list{
                @include flex-col;
                padding-top: 10px;
                gap: 3px;
                transition: .3s;
                overflow: hidden;

                .item{
                    display: flex;
                    position: relative;
                    padding-left: 32px;
                    align-items: center;
                    gap: 12px;
                    overflow: hidden;
                    flex-shrink: 0;

                    &::before{
                        @include pseudo-absolute;
                        height: 6px;
                        width: 6px;
                        border-radius: 50%;
                        background: var(--typo-control-ghost);
                        left: 13px;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                    }

                    .inp{
                        width: 55px;
                    }

                    &-title{
                        padding-bottom: 2px;
                    }
                }
            }

            &[drop]{
                .drop{
                    transform: rotate(.5turn);
                }
            }
        }
    }
</style>