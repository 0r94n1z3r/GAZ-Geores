<template>
     <div class="m-data-input">
        <div class="title-wr">
            <p>{{title}}</p>
            <div class="err" v-if="error">{{error}}</div>
        </div>
        <div class="no-data" v-if="val == null" @click="val = true;">
            добавить значение
        </div>
        <div class="inputs" v-else :blush="errorBlush || null">
            <label class="checkbox">
                <input type="checkbox" v-model="val">
                <span></span>
            </label>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref, watch } from "vue";

    const props = defineProps({
        title: String,
        value: Object, //{p90, p50, p10}

        reversed: Boolean,

        error: [String, Array],
        errorBlush: Boolean,
    });

    const emit = defineEmits(['update']);
    const val = ref(
        props.value?.p50 == null?
        null:
        props.reversed?!props.value?.p50:!!props.value?.p50
    );

    watch(()=>props.value?.p50, (n,o)=>{
        if(n != o)
            val.value = n == null?null:
            props.reversed?!n:!!n
    })

    watch(val, (n,o)=>{
        if(n != o){
            let val = props.reversed?
                (n?0:1):
                (n?1:0)
            emit('update', {p90: val, p50: val, p10: val})
        }
    })
</script>

<style lang="scss" scoped>
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
            align-items: center;

            label{
                height: 16px;
            }
        }

        .no-data{
            cursor: pointer;
            color: var(--typo-brand);
            height: 32px;
            display: flex;
            align-items: center;

            &:hover{
                color: var(--bg-shadow);
            }
        }
    }
</style>