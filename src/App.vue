<template>
    <div class="glob-wr">
        <VHeader/>

        <div class="page-wr">
            <div class="loader-wr" v-if="user.isLogged === null">
                <VLoading/>
            </div>

            <VAuth v-else-if="!user.isLogged"/>

            <VContent v-else/>
        </div>

        <DeleteAlertModal/>
        <AlertModal/>
    </div>
</template>

<script setup>
import VHeader from "@/components/header/VHeader.vue";
import VAuth from "@/components/auth/VAuth.vue";

import DeleteAlertModal from "@/components/DeleteAlertModal.vue";
import AlertModal from "@/components/AlertModal.vue";

import VContent from "@/components/VContent.vue";

import { useUserStore } from "@/stores/user.js";

const user = useUserStore();
</script>

<style lang="scss">
@import '@/style/reset.scss';
@import '@/style/colors.scss';
@import '@/style/style.scss';
</style>

<style lang="scss" scoped>
    .glob-wr{
        height: 100%;
        @include flex-col;

        .page-wr{
            height: 100%;
            flex-grow: 1;
            min-height: 0;
        }
    }

    .loader-wr{
        height: 100%;
        width: 100%;
        @include flex-c;
        padding-bottom: 60px;
    }
</style>
