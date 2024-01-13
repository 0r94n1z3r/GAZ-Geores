<template>
    <div class="header">
        <div class="menu-wr">
            <div class="logo">
                <img src="/img/logo.png" alt="">
            </div>

            <PageNavigation
                :list="pageNavListDisplay"
                class="nav"
                tall
                v-if="user.isLogged"
            />
        </div>
        
        <UserDrop v-if="user.isLogged" class="user"/>
    </div>
</template>

<script setup>
    import UserDrop from '@/components/header/UserDrop.vue';
    import PageNavigation from "@/components/page/PageNavigation.vue";
    

    import { useUserStore } from "@/stores/user.js";
    import RouterControl from "@/stores/routerControl.js";
    
    import { computed, ref } from 'vue';

    const user = useUserStore();
    const R = RouterControl();

    const pageNavList = ref([
        {
            title: 'Вероятностная оценка запасов',
            mode: 'GeoRes',
        },
        {
            title: 'Расчёт профилей добычи',
            mode: 'MiningCalc',
            // disabled: true,
        },
        {
            title: 'Обустройство месторождения',
            mode: 'FieldDev',
            // disabled: true,
        },
        {
            title: 'Оценка экономической эффективности',
            mode: 'Economics',
        },
    ]);

    const pageNavListDisplay = computed(()=>pageNavList.value.map(e => {
        return {
            title: e.title,
            click: ()=>R.setMode(e.mode),
            active: ()=>R.route?.name && R.route.name.split('_')[0] == e.mode,
            disabled: e.disabled
        }
    }));
</script>

<style lang="scss" scoped>
    

    .header{
        min-height: 60px;
        @include flex-jtf;
        
        padding: 0 24px;
        border-bottom: 1px solid var(--bg-border);
        flex-shrink: 0;
        gap: 24px;

        .menu-wr{
            display: flex;
            gap: 64px;
        }

        .logo{
            height: 43px;
            margin-top: 10px;

            img{
                height: 100%;
            }
        }

        .user{
            height: 32px;
            margin-top: 15px;
        }
    }
</style>