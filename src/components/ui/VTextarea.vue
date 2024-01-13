<template>
    <div class="input" :err="err || null" :dynamic="dynamic || null">
        <div class="content" @click="focus()" :focused="focused || null">
            <textarea 
                :type="type" 
                v-model="text" 
                :placeholder="placeholder"
                ref="inp"
                @focus="focusHandler"
                @blur="focused = false"
                :rows="rows"
            ></textarea>

            <div class="options">
                <slot/>
            </div>
        </div>
        <div class="err" v-if="typeof err == 'string' && err">{{err}}</div>
    </div>
</template>

<script setup>
    import { ref, watch } from "vue";

    const props = defineProps({
        modelValue: [String, Number],
        type:{
            type: String,
            default: 'text'
        },
        err: [String, Boolean],
        placeholder: String,
        dynamic: Boolean,
        rows: String
    });

    const emit = defineEmits(['update:modelValue', 'focus']);

//text
    const text = ref(props.modelValue || '');
    watch(text, (n)=>emit('update:modelValue', n));
    watch(()=>props.modelValue, (n)=>text.value = n);

//focus
    const inp = ref(null);

    const focus = ()=>{
        inp.value.focus();
    }

    defineExpose({focus});

    const focused = ref(false);

    const focusHandler = ()=>{
        emit('focus');
        focused.value = true;
    }
</script>

<style lang="scss" scoped>
    .input{
        width: 100%;
        font-size: 14px;

        .content{
            border: 1px solid var(--bg-border);
            border-radius: 4px;
            display: flex;

            transition: .3s;

            textarea{
                border: none;
                background: transparent;
                min-width: 100%;
                padding: 6px 9px;
                border-radius: 3px;
                font-size: inherit;
                min-height: 32px;

                &::placeholder{
                    color: #00203359;
                }
            }

            &[focused]{
                border-color: var(--bg-border-focus);
            }
        }

        &[big]{
            .content{
                height: 48px;

                input{
                    padding: 0 13px;
                    font-size: 18px;
                }
            }
        }

        .err{
            font-size: 12px;
            color: var(--typo-alert);
            padding: 1px 9px;
        }

        &[big]{
            .err{
                padding: 2px 13px;
            }
        }

        &[err]{
            .content{
                border-color: var(--bg-alert);
            }
        }
    }
</style>