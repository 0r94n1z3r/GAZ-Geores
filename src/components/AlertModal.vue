<template>
    <VModal class="alert-modal" ref="modal" :title="alert.title">
        <div class="content" v-if="alert.content">
            {{alert.content}}
        </div>
        <div class="footer">
            <div class="btns">
                <VButton @click="modal.close()">Ок</VButton>
            </div>
        </div>
    </VModal>
</template>

<script setup>
    import { onMounted, ref, watch } from "vue";

    import { useAlertStore } from "@/stores/alert.js"

    const alert = useAlertStore();

    //call
        const modal = ref(null); 
        onMounted(()=>alert.init(modal.value));
</script>

<style lang="scss" scoped>
    @import "@/style/mixins.scss";

    .alert-modal{
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

    .content{
        padding: 0 20px 24px 29px;
    }

    .footer{
        @include flex-jtf;
        align-items: center;
        gap: 16px;
        padding: 0 20px 16px 29px;
        
            justify-content: end;

        .btns{
            display: flex;
            gap: 8px;

            .btn{
                height: 32px;
                padding: 0 14px;
                padding-bottom: 1px;
            }
        }
    }
    
</style>