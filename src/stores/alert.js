import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted } from "vue";

export const useAlertStore = defineStore("alert", ()=>{

    const modal = ref(); 

    const init = (obj)=>modal.value = obj;

    const title = ref('');
    const content = ref('');

    const call = (tit, cont)=>{
        title.value = tit;
        content.value = cont;
        modal.value.call();
    }

    const close = ()=>{
        modal.value.close();
    }

//----------------------------------------------------------------
    return {
        init,
        title, 
        content,
        call,
        close,
    }
});