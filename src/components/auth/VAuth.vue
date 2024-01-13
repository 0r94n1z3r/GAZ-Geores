<template>
    <div class="auth">
        <div class="form">
            <div class="inp-wr">
                <div class="title">Логин</div>
                <VTextInput 
                    big 
                    v-model="info.username"
                    placeholder="Введите почту..."
                    name="login"
                    :err="!!error"
                    :ref="e=>inputRef[0] = e"
                    @keydown.enter="inputRef[1].focus()"
                    @focus="error = ''"
                />
            </div>
            <div class="inp-wr">
                <div class="title">Пароль</div>
                <VPasswInput
                    big 
                    v-model="info.password"
                    placeholder="Введите пароль..."
                    name="password"
                    :err="error"
                    :ref="e=>inputRef[1] = e"
                    @keydown.enter="login"
                    @focus="error = ''"
                />
            </div>
            <VButton @click="login" :loading="loading || null">Войти</VButton>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, reactive, ref } from "vue";

    import VPasswInput from "@/components/ui/VPasswInput.vue";

    import { useUserStore } from "@/stores/user.js";

    const user = useUserStore();

    const info = reactive({
        username: '',
        password: ''
    });

    const error = ref('');

    const loading = ref(false);

    const login = ()=>{
        error.value = '';

        if(!info.username ||  !info.password){
            error.value = 'Заполните поле';
            return;
        }

        loading.value = true; 

        user.login(info.username, info.password, (err)=>{
            error.value = err; 
            loading.value = false; 
        })
    }

//focus
    const inputRef = ref([]);

    onMounted(()=>{
        inputRef.value[0]?.focus();
    })



</script>

<style lang="scss" scoped>
    

    .auth{
        height: 100%;
        @include flex-c;
        padding-bottom: 60px;

        .form{
            width: 100%;
            max-width: 442px;
            @include flex-col;
            gap: 16px;

            .inp-wr{
                .title{
                    color: var(--typo-secondary);
                    font-size: 18px;
                    margin-bottom: 8px;
                }
            }

            .btn{
                height: 40px;
                margin-top: 24px ;
            }
        }
    }
</style>