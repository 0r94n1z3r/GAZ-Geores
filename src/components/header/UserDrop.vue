<template>
    <div class="user-drop" v-Click-Outside="()=>{drop = false}" @click="drop = !drop">
        <!-- <img v-if="userInfo['avatar']" :src="userInfo['avatar']" alt="" class="avatar"> -->
        <div class="info">
            <div class="name">{{user.info.username}}</div>
            <div class="status">{{userInfo['role']}}</div>
        </div>
        <IDrop class="drop-icon"/>

        <div class="drop" :drop="drop || null">
            <VButton hollow @click="user.exit();">Выйти</VButton>
        </div>
    </div>
</template>

<script setup>
    import IDrop from '@/components/icons/IDrop.vue';
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';
    import { getCookie } from '@/script/cookie.js';

    import { reactive, ref } from 'vue';

    import { useUserStore } from "@/stores/user.js";
    const user = useUserStore();

    const drop = ref(false);

    const userInfo = {//notDone
        avatar: '//picsum.photos/200/300',
        username: 'Test',
        role: 'Test',
    };    
</script>

<style lang="scss" scoped>
    

    .user-drop{
        position: relative;
        display: flex;
        gap: 10px;
        align-items: center;
        cursor: pointer;
        max-width: 200px;

        .avatar{
            border-radius: 50%;
            height: 32px;
            width: 32px;
            flex-shrink: 0;
        }

        .info{
            @include flex-col;
            justify-content: center;
            min-width: 0;

            .name{
                font-size: 16px;
                line-height: .8;
                @include text-overflow;
            }

            .status{
                font-size: 12px;
                color: var(--typo-secondary);
            }
        }

        .drop-icon{
            color: var(--c-dark);
            flex-shrink: 0;
        }

        .drop{
            position: absolute;
            right: 0;
            top: calc(100% + 10px);
            width: 100px;
            padding: 5px;
            border-radius: 4px;
            transition: .3s;

            z-index: 1;

            background: var(--c-white);
            box-shadow: var(--shadow);

            &:not([drop]){
                @include hidden(-10px)
            }

            .btn{
                height: 30px;
            }
        }
    }
</style>