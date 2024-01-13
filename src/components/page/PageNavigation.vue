<template>
    <div class="page-navigation">
        <div class="item" 
            v-for="(i,k) in list" 
            :key="k" 

            :disabled="i.disabled || null"
            :active="i.active?.() || null"

            :drop="i.list?.drop || null"
            v-Click-Outside="()=>{if(i.list)i.list.drop = false}"
        >
            <div 
                class="title" 
                @click="i.click"
            >
                {{i?.list?.activeItem?.[i.list.key] || i.title}}
            </div>
            <div 
                class="info-caller"
                v-if="i.info"
                @click="i.info.call()"
            >
                <IInfo class="ico"/>
            </div>
            <div class="drop-caller" @click="i.list.drop = !i.list.drop" v-if="i.list">
                <IDrop class="ico"/>
            </div>
            <div class="drop" v-if="i.list">
                <div 
                    class="drop-item" 
                    v-for="l in i.list.list" 
                    :key="l[i.list.key]"
                    @click="i.list.activeItem = l; i.list.drop = false"
                >
                    {{l[i.list.key]}}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue";

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import IDrop from "@/components/icons/IDrop.vue";
    
    import { useProjectStore } from "@/stores/project.js";
    const proj = useProjectStore();

    const props = defineProps({
        list: Array
    });
</script>

<style lang="scss" scoped>
    

    .page-navigation{
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;

        font-size: 16px;

        .item{
            display: flex;
            gap: .15em;
            min-height: 1.4em;
            position: relative;

            --color: var(--typo-control-ghost);

            &[active]{
                --color: var(--typo-control-secondary);

                .title{
                    color: black;
                }
            }
            &[disabled]{
                --color: var(--typo-control-disable);

                .title{ 
                    pointer-events: none;
                }
            }

            color: var(--color);

            .title{
                position: relative;
                white-space: nowrap;

                cursor: pointer;

                &::before, &::after{
                    @include pseudo-absolute;

                    top: calc(100% + 2px);
                    left: 0;
                    height: 2px;
                    width: 100%;
                    border-radius: 4px;
                    transition: .3s;
                }

                &::before{
                    background: var(--bg-control-ghost);;
                }

                &::after{
                    background: var(--color);
                }

                &:not(:hover){
                    &::after{
                        width: 0;
                    }
                }
            }

            &[active]{
                .title::after{
                    width: 100%;
                }
            }

            .info-caller{
                @include flex-c;
                cursor: pointer;
                height: 1.4em;
                width: 1.4em;

                .ico{
                    width: 55%;
                    height: 55%;
                }
            }

            .drop-caller{
                cursor: pointer;
                color: black;
                width: 1.4em;
                @include flex-c;
                rotate: .5turn;
                transition: .3s;
            }

            .drop{
                position: absolute;
                top: calc(100% + 4px);
                z-index: 5;
                background: var(--bg-default);
                transition: .3s;
                padding: 3px 0;

                border: 1px solid rgba(0, 65, 102, 0.2);
                box-shadow: 0px 4px 4px rgba(0, 32, 51, 0.04), 0px 8px 24px rgba(0, 32, 51, 0.12);
                border-radius: 4px;

                .drop-item{
                    white-space: nowrap;
                    cursor: pointer;
                    color: black;
                    padding: 6px 13px;
                    transition: .3s;

                    &:hover{
                        background: var(--bg-ghost);
                    }
                }
            }

            &:not([drop]){
                .drop-caller{
                    rotate: 0deg;
                }

                .drop{
                    @include hidden(-10px);
                }
            }
        }

        &[tall]{
            .item{
                height: 60px;

                .title{
                    align-items: center;
                    display: flex;
                    &::before, &::after{
                        top: unset;
                        bottom: 0;
                    }
                }
            }
            
        }

        
    }
</style>