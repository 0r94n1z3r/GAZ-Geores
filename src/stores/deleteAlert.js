import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted } from "vue";
import { useAlertStore } from "@/stores/alert.js";

export const useDeleteAlertStore = defineStore("deleteAlert", ()=>{
    const alert = useAlertStore();

    const modal = ref(); 

    const callback = ref();

    const doNotShowAgain = ref(false)

    const init = (obj)=>modal.value = obj;

    const call = (item, cb)=>{
        if(item.layers?.length){
            alert.call('Внимание!', 'Вы не можете удалить пласт с залежами.');
            return;
        }

        callback.value = cb; 
        if(!doNotShowAgain.value){
            modal.value.call();
        }else{
            callback.value();
        }
    }

    const close = ()=>{
        callback.value = null;
        modal.value.close();
    }

//----------------------------------------------------------------
    return {
        init,
        callback,
        doNotShowAgain,
        call,
        close,
    }
});