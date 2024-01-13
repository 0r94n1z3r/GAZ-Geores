import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted } from "vue";
import { sendAPI } from '@/script/api';
import { getCookie, setCookie, deleteCookie } from "@/script/cookie.js";
import { useProjectStore } from '@/stores/project.js';

export const useUserStore = defineStore("user", ()=>{

    const project = useProjectStore();

    const isLogged = ref(null); //null by default
    const info = ref({});

    const login = (username, password, errCb)=>{
        sendAPI(
            'post',
            '/auth/login/',
            {username, password},
            (res)=>{
                if(res.access_token){
                    setCookie('token', res.access_token, {'max-age': 2678400000});
                    setCookie('refresh-token', res.refresh_token, {'max-age': 2678400000});
                    setCookie('user', JSON.stringify(res.user), {'max-age': 2678400000});
                    info.value = res.user;
                    isLogged.value = true;
                }else{
                    errCb(res);
                }
            },
            (err)=>{
                errCb(err);
            }
        )
    };


    const exit = ()=>{
        isLogged.value = false;
        deleteCookie('token');
        deleteCookie('refresh-token');
        deleteCookie('user');
        info.value = {};
    };

    onMounted(()=>{
        if(!getCookie('token')){
            exit();
            return;
        }

        verify();
    });

    const refresh = (callback)=>{
        if(!getCookie('refresh-token')){
            exit();
            return;
        }

        sendAPI(
            'post',
            '/auth/token/refresh/',
            {refresh: getCookie('refresh-token')},
            (resp)=>{
                setCookie('token', resp.access, {'max-age': 2678400000});
                callback();
            },
            exit
        );
    }

    const verify = ()=>{
        sendAPI(
            'post',
            '/auth/token/verify/',
            {token: getCookie('token')},
            ()=>{;
                setCookie('token', getCookie('token'), {'max-age': 2678400000});
                setCookie('refresh-token', getCookie('refresh-token'), {'max-age': 2678400000});
                setCookie('user', getCookie('user'), {'max-age': 2678400000});
                info.value = JSON.parse(getCookie('user'));
                isLogged.value = true;
            }
        );
    }

    

//----------------------------------------------------------------
    return {
        isLogged,
        info,

        login,
        exit,
        refresh,
        verify
    }
})