<template>
    <div class="m-data-input">
        <div class="title-wr">
            <p>{{title}}</p>
            <div class="control" v-if="shrinkable" :blank="!multiPerc || null" @click="multiPerc = !multiPerc">
                <IPlus class="ico" v-if="!multiPerc"/>
                <IMinus class="ico" v-else/>
            </div>
            <div class="err" v-if="error">{{error}}</div>
        </div>
        <div class="inputs" :blush="errorBlush || null" v-if="value" :loading="loading || null">
            <ILoader v-show="loading" class="loader"/>
            <div class="inp-wr" v-if="year">
                <div class="locked">{{year}}</div>
            </div>
            <div class="inp-wr" v-if="shrinkable?
                shrinkStates[multiPerc?0:1].includes('p90'):
                showPercs.includes('p90')
            ">
                <VTextInput blurOnly type="number" @update="update" :round-to="roundTo" :borders="borders" v-model="value.p90" htmlPlaceholder="P<span class='sub'>90</span>" err-absolute v-if="!locked"/>
                <div class="locked" v-else>{{value?.p90 != null ? ( roundTo != null?round(parseFloat(value?.p90), roundTo) : value?.p90 ) : ''}}</div>
            </div>
            <div class="inp-wr" v-if="shrinkable?
                shrinkStates[multiPerc?0:1].includes('p50'):
                showPercs.includes('p50')
            ">
                <VTextInput blurOnly type="number" @update="update" :round-to="roundTo" :borders="borders" v-model="value.p50" htmlPlaceholder="P<span class='sub'>50</span>" err-absolute  v-if="!locked"/>
                <div class="locked" v-else>{{value?.p50 != null ? ( roundTo != null?round(parseFloat(value?.p50), roundTo) : value?.p50 ) : ''}}</div>
            </div>
            <div class="inp-wr" v-if="shrinkable?
                shrinkStates[multiPerc?0:1].includes('p10'):
                showPercs.includes('p10')
            ">
                <VTextInput blurOnly type="number" @update="update" :round-to="roundTo" :borders="borders" v-model="value.p10" htmlPlaceholder="P<span class='sub'>10</span>" err-absolute v-if="!locked"/>
                <div class="locked" v-else>{{value?.p10 != null ? ( roundTo != null?round(parseFloat(value?.p10), roundTo) : value?.p10 ) : ''}}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import IPlus from "@/components/icons/IPlus.vue";
    import IMinus from "@/components/icons/IMinus.vue";
    import ILoader from "@/components/icons/ILoader.vue";
    
    import { round } from '@/helpers/number.js';
    
    import { onMounted, ref, watch } from "vue";

    const props = defineProps({
        title: String,
        value: Object, //{p90, p50, p10}
        
        showPercs: {
            type: Array,
            default: ['p90', 'p50', 'p10']
        },
        
        locked: Boolean,
        shrinkable: Boolean,
        shrinkableRev: Boolean,

        shrinkStates:{
            type: Array,
            default: [['p90', 'p50', 'p10'], ['p50']]
        },
        
        year: [String, Number],

        error: [String, Array],
        errorBlush: Boolean,

        roundTo: Number,

        borders: String,

        loading: Boolean,
    });

    const emit = defineEmits(['update']);

    const multiPerc = ref(!props.shrinkableRev);

    const update = ()=>{
        let v = props.value;
        // if(v.p10 == null)v.p10 = v.p50 || v.p90; 
        // if(v.p90 == null)v.p90 = v.p50 || v.p10; 
        // if(v.p50 == null)v.p50 = v.p90 || v.p10; 

        if(!multiPerc.value){
            v.p10 = JSON.parse(JSON.stringify(v.p50));
            v.p90 = JSON.parse(JSON.stringify(v.p50));
        }

        emit('update', v);
    };

    watch(()=>props.value, n => {
        if(props.roundTo != null){
            props.value.p10 = round(n.p10, props.roundTo);
            props.value.p90 = round(n.p90, props.roundTo);
            props.value.p50 = round(n.p50, props.roundTo);
        }
    });
</script>

<style lang="scss">
    .m-data-input{
        display: flex;
        align-items: start;
        gap: 13px;

        .title-wr{
            @include flex-jtf;
            align-items: start;
            gap: 10px;
            width: 430px;
            position: relative;

            p{
                min-height: 32px;
                display: flex;
                align-items: center;
                width: 100%;
            }
        
            .err{
                position: absolute;
                top: 100%;
                left: 0;
                color: var(--typo-alert);
                transform: translateY(-9px);
            }
    

            .control{
                --color: var(--bg-border);

                @include flex-c;
                height: 18px;
                width: 18px;
                flex-shrink: 0;
                border: 1px solid var(--color);
                border-radius: 50%;
                cursor: pointer;
                transition: .3s;
                margin-top: 7px;

                .ico{
                    color: var(--color);
                    width: 65%;
                    height: 65%;
                    transition: .3s;
                }

                &:hover{
                    --color: var(--bg-border-focus)
                }

                &[blank]{
                    background: var(--bg-control-primary);
                    border-color: transparent;

                    .ico{
                        color: var(--bg-default)
                    }
                }
            }
        }

        .inputs{
            display: flex;
            height: 32px;
            position: relative;

            &[loading]{
                .inp-wr{
                    opacity: .7;
                    pointer-events: none;
                }
            }

            .loader{
                position: absolute;
                pointer-events: none;
                left: 0;
                right: 0;
                top: 12px;
                margin: auto;

                height: 10px;
                width: 30px;

                color: var(--bg-control-primary);
            }

            .inp-wr{
                border: 1px solid var(--bg-border);
                width: 108px;

                &:first-child{
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }
                
                &:last-child{
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }

                &:not(:last-child){
                    border-right-width: 0;
                }

                .input, .input input, .input .content{
                    text-align: center;
                    border: 0;
                    height: 100%;
                }

                .locked{
                    height: 100%;
                    font-size: 14px;
                    background: var(--bg-ghost);
                    @include text-overflow;
                    padding: 6.5px 8px;
                    text-align: center;
                }
            }

            &[blush]{
                .inp-wr{
                    border-color: var(--typo-alert);
                }
            }
        }
    }
</style>