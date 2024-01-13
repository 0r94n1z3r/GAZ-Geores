<template>
    <div class="btn" :loading="loading || null" :hollow="hollow || null">
        <VLoading 
            v-if="loading" 
            hollow
            :inversed="!hollow || null"
            class="loading"
        />
        <div class="content" :style="{opacity: loading?0:1}">
            <slot/>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        loading: Boolean,
        hollow: Boolean,
    })
</script>

<style lang="scss" scoped>
    

    .btn{
        --bg: var(--bg-control-primary);
        --txt: var(--c-white);
        --hov: var(--bg-control-primary-hover);
        --act: var(--bg-control-primary);

        &[grey]{
            --bg: var(--bg-control-ghost);
            --txt: var(--typo-control-ghost);
            --hov: var(--bg-control-ghost-hover);
            --act: var(--bg-control-ghost);
        }

        &[red]{
            --bg:  var(--typo-alert);
            --txt: var(--c-white);
            --hov: var(--bg-alert);
            --act: var(--typo-alert);
        }

        cursor: pointer;
        @include flex-c;
        height: 48px;
        width: 100%;
        background: var(--bg);
        color: var(--txt);
        border-radius: 4px;
        font-size: 16px;
        transition: .3s;
        position: relative;
        
        &[fit]{
            height: max-content;
            width: max-content;
            padding: .2em 0.5em
        }

        .content{
            @include flex-c;
            gap: 10px;
            width: 100%;
            height: 100%;
        }

        .loading{
            position: absolute;
            @include all-directions(0);
            margin: auto;
            max-width: 100%;
            color: var(--txt)!important;
        }

        &:hover{
            background: var(--hov);
        }

        &:active{
            transition: 0.01s;
            background: var(--act);
        }

        &[loading]{
            pointer-events: none;
            animation: pulse .6s linear alternate infinite;
        }

        &[disabled]{
            opacity: .7;
            pointer-events: none;
        }

        @include pulse-anim;

        &[hollow]{
            background: transparent;
            border: 1px solid var(--bg);;
            color: var(--bg);

            .loading{
                color: var(--bg)!important;
            }
            
            &:hover{
                border-color: var(--hov);
                color: var(--hov);
            }

            &:active{
                border-color: var(--act);
                color: var(--act);
            }
        }

        

        

        
    }
</style>