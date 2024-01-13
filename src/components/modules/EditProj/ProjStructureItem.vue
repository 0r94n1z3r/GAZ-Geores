<template>
    <div class="navbar-item">
        <div class="item-content">
            <div class="title">
                <div class="ico-wr"></div>
                <h3>{{title}}</h3>
            </div>
            <div class="container">
                <div class="ico-wr grip" v-if="!isEdit"><IGrip class="ico"/></div>
                <VTextInput
                    v-model="item.name"
                    :err="err"
                    @focus="err = ''"
                    @blur="()=>{if(!item.name)err = 'Заполните поле'}"
                />
                <div class="ico-wr cross" @click="deleteMe"><ICross class="ico"/></div>
            </div>
        </div>
        <div class="drop-container" v-if="item.layers">
            <ProjStructureList 
                v-if="item.layers"
                :list="item.layers"
                :id="item.id"
                title="Название залежи"
                :isEdit="isEdit"
            />
            <div class="navbar-item add-btn" @click="addLayer">
                <div class="item-content">
                    <div class="container">
                        <div class="ico-wr"><IPlus class="ico"/></div>
                        <div class="name">Добавить залежь</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    
    import IPlus from '@/components/icons/IPlus.vue';
    import IGrip from '@/components/icons/IGrip.vue';
    import ICross from '@/components/icons/ICross.vue';

    import ProjStructureList from "./ProjStructureList.vue";

    import { useProjectStore } from "@/stores/project.js";
    import { useDeleteAlertStore } from "@/stores/deleteAlert.js";
    
    const props = defineProps({
        item: Object,
        localId: Number,
        parentList: Array,
        title: String,
        isEdit: Boolean,
    });

    const proj = useProjectStore();
    const deleteAlert = useDeleteAlertStore();

    const addLayer = ()=>{
        props.item.layers.push({
            name: "",
            fluid_type: "empty",
            loading: true
        })
    }

    const deleteMe = ()=>{
        if(props.isEdit){
            deleteAlert.call(props.item, ()=>props.parentList.splice(props.localId, 1));
        }else{
            props.parentList.splice(props.localId, 1)
        }
    }

    const err = ref('');


</script>

<style lang="scss" scoped>
    

    .navbar-item{
        position: relative;
        width: 450px;

        .item-content{
            width: 100%;

            .title{
                display: flex;
                gap: 8px;
                padding: 8px 0;

                h3{
                    font-size: 16px;
                    color: var(--typo-secondary);
                }
            }

            .container{
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                width: 100%;
                height: 32px;

                &:not(:hover){
                    .cross{
                        @include hidden-hor(-10px);
                    }
                }
            }

            .ico-wr{
                @include flex-c;
                height: 100%;
                width: 22px;
                flex-shrink: 0;
                
                color: var(--bg-tone);

                .ico{
                    color: inherit;
                }

                &.cross{
                    cursor: pointer;
                    transition: .3s;
                }
            }

            .grip{
                cursor: grab;

                &:active{
                    cursor: grabbing;
                }
            }
        }

        .drop-container{
            padding-left: 24px;
        }

        &.add-btn{
            cursor: pointer;
            margin-top: 8px;
            padding-left: 30px;

            .item-content, .container .name{
                color: var(--typo-brand)
            }

            .ico-wr{
                height: 32px;
                width: 32px;
                margin: 0 -8px;
                @include flex-c;

                .ico{
                    height: 12px;
                    width: 12px;
                    color: var(--typo-brand);
                    margin-bottom: -3px;
                }
            }
        }

        :deep(.err){
            position: absolute;
        }
    }
</style>