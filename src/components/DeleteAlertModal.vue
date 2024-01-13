<template>
    <VModal class="delete-alert-modal" ref="modal" title="Удалить безвозвратно?">
        <div class="footer">
            <div class="confirm">
                <label class="checkbox">
                    <input type="checkbox" v-model="deleteAlert.doNotShowAgain">
                    <span>Больше не показывать</span>
                </label>
            </div>
            <div class="btns">
                <VButton hollow @click="close()">Отмена</VButton>
                <VButton @click="deleteHandler">Удалить</VButton>
            </div>
        </div>
    </VModal>
</template>

<script setup>
    import { onMounted, ref, watch } from "vue";

    import { useDeleteAlertStore } from "@/stores/deleteAlert.js"

    const deleteAlert = useDeleteAlertStore();

    const deleteHandler = ()=>{
        deleteAlert.callback();
        close();
    }

    //call
        const modal = ref(null); 
        onMounted(()=>deleteAlert.init(modal.value));

        const call = ()=>{
            modal.value.call();
        }
        const close = ()=>{
            modal.value.close();
        }
</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .delete-alert-modal{
        :deep(.modal){
            width: 100%;
            max-width: 460px!important;

            .top{
                padding-top: 16px;
                padding-left: 29px;
                padding-bottom: 0px;

                .close-container{
                    margin-top: -11px;
                }
            }
        }
    }

    .footer{
        @include flex-jtf;
        align-items: center;
        gap: 16px;
        padding: 0 20px 16px 29px;

        label{
            span{
                font-size: 16px;
                white-space: nowrap;
            }
        }

        .btns{
            display: flex;
            gap: 8px;

            .btn{
                height: 32px;
                padding: 0 14px;
            }
        }
    }
    
</style>