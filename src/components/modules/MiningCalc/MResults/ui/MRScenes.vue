<template>
    <div class="wr">
        <div class="tags" v-if="!only">
            <div class="tag" v-for="(i,k) in modelValue" :key="k">
                <img v-show="i.loading" src="/img/loader.svg" class="loading" alt=""> {{i.title}}
                <div 
                    class="close"
                    @click="removeScene(i)"
                >
                    <ICross class="ico"/>
                </div>
            </div>
        </div>

        <div class="search-wr" :drop="drop || null" v-click-outside="()=>{if(only){checkValid()}else{drop = false}}">
            <VTextInput 
                v-model="search" 
                @focus="drop = true" 
                @keydown="noBtn = false"
                @keydown.enter="checkValid()"
            >
                <div class="drop-ico" @click.stop="drop = !drop"><IDrop class="ico"/></div>
            </VTextInput>

            <div class="drop" :bottom="bottom || null">
                <div class="drop-title" v-if="filteredScenes.objects.length !== 1 || groupOnly">ГРУППА ОБЪЕКТОВ РАЗРАБОТКИ</div>
                <template v-if="only">
                    <template v-if="filteredScenes.objects.length !== 1 || groupOnly">
                        <div 
                            class="item" 
                            v-for="(i,k) in filteredScenes.group" 
                            :key="k"
                            @click="confirm(i)"
                        >
                            {{i.title}}
                            <ITick class="tick" v-if="!selectedOnly && selectedPercs?.includes(pString(i))"/>
                        </div>
                    </template>
                    <template v-if="filteredScenes.objects.length > 0 && !groupOnly">
                        <div
                            v-for="(j,f) in filteredScenes.objects" 
                            :key="f"
                        >
                            <div class="drop-title">ОБЪЕКТ РАЗРАБОТКИ: {{j.title}}</div>
                            <div class="item" v-for="(i,k) in j.list" :key="k" @click="confirm(i)">
                                {{i.title}}
                                <ITick class="tick" v-if="!selectedOnly && selectedPercs?.includes(pString(i))"/>
                            </div>
                        </div>
                    </template>
                </template>

                <template v-else>
                    <template v-if="filteredScenes.objects.length !== 1 || groupOnly">
                        <div class="item" v-for="(i,k) in filteredScenes.group" :key="k">
                            <label class="checkbox">
                                <input 
                                    type="checkbox" 
                                    v-model="i.value" 
                                    @click="updateSelectedScenes('Group')"
                                >
                                <span>{{i.title}}</span>
                            </label>
                        </div>
                    </template>
                    <template v-if="filteredScenes.objects.length > 0 && !groupOnly">
                        <div v-for="(j,f) in filteredScenes.objects" :key="f">
                            <div class="drop-title">ОБЪЕКТ РАЗРАБОТКИ: {{j.title}}</div>
                            <div class="item" v-for="(i,k) in j.list" :key="k">
                                <label class="checkbox">
                                    <input 
                                        type="checkbox" 
                                        v-model="i.value" 
                                        @click="updateSelectedScenes('Object')"
                                    >
                                    <span>{{i.title}}</span>
                                </label>
                            </div>
                        </div>
                    </template>
                </template>
                
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref, watch } from "vue";

    import ICross from "@/components/icons/ICross.vue";
    import IDrop from "@/components/icons/IDrop.vue";
    import ITick from "@/components/icons/ITick.vue";

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import MiningStore from '@/stores/mining.js';

    const props = defineProps({
        modelValue: Array,
        only: Boolean,
        groupOnly: Boolean,

        bottom: Boolean,

        selectedPercs: Array,
        selectedOnly: Boolean
    });

    const emit = defineEmits(['update:modelValue', 'change'])

    const Mining = MiningStore();

    const search = ref(props.only?props.modelValue?.[0]?.title || '':'');
    watch(()=>props.modelValue?.[0]?.title, (n)=>{
        if(props.only)search.value = n || '';
    });

    const drop = ref(false);

    const startup = ref(false);

    //noBtn
        const noBtn = ref(true);
        watch(drop, ()=>setTimeout(()=>noBtn.value = true, 301));

    const scenes = computed(()=>{
        const getPercsList = (title, id)=>{
            let res = [];
                        
            [90, 50, 10].forEach(p1 => {
                [90, 50, 10].forEach(p2 => {
                    res.push({title: `${title} (P${p1}/P${p2})`, id, p: [p1, p2], value: false})
                })
            })

            return res;
        }

        //objects
            let objects = Mining.objects?.map(e => {
                return {
                    title: e.name,
                    list: getPercsList(e.name, e.id)
                }
            }) || []

        //group
            let group = [];

            objects.forEach((obj, k)=>{
                let tmpGroup = [];

                if(k==0){
                    tmpGroup = obj.list.filter(e => !e.all).map(e => [e]);
                }else{
                    obj.list.forEach((i,f,list)=>{
                        group.forEach(g => {
                            tmpGroup.push([...g, i])
                        })
                    })
                }

                group = tmpGroup;
            })

            group = group.map(e => { return {
                title: e.map(i => i.title).join(' + '),
                list: e,
                value: false
            }})

        return{
            group,
            objects
        }
    });

    const filteredScenes = computed(()=>{
        if((props.only && noBtn.value) || !search.value){
            return {
                group: scenes.value.group,//.filter(e => (!props.selectedOnly || props.selectedPercs?.includes(pString(e)))),
                objects: scenes.value.objects.map(e => Object.assign({}, e, {list: e.list}))//.filter(e => (!props.selectedOnly || props.selectedPercs?.includes(pString(e))))
            }
        }

        return {
            group: scenes.value.group.filter(e => 
                e.title.toUpperCase().includes(search.value.toUpperCase()) //&&
                //(!props.selectedOnly || props.selectedPercs.includes(pString(e)))
            ),
            objects: scenes.value.objects.map(e => Object.assign({}, e, {list: e.list.filter(i => 
                i.title.toUpperCase().includes(search.value.toUpperCase()))}) //&&
                //(!props.selectedOnly || props.selectedPercs.includes(pString(e)))
            )
        }
    });

    onMounted(()=>{
        setTimeout(()=>{
            if(!scenes.value?.group?.[0])return;

            if(filteredScenes.value.objects.length !== 1){
                scenes.value.group[0].value = true;
            }else{
                scenes.value.group[0].list[0].value = true
            }
            
            updateSelectedScenes();
        }, 600);
    })



//selectedScenes
    const updateSelectedScenes = (level)=>{
        if(level){
            Mining.resOverriddenLevel = level;
            if(level == "Group"){
                scenes?.value?.objects?.forEach(obj =>{
                    obj.list.forEach(i => {i.value = false;})
                })
            }else if(level == "Object"){
                scenes?.value?.group?.forEach(e => e.value = false)
            }
        }

        setTimeout(()=>{
            emit('update:modelValue', [
                ...scenes.value.group.filter(e => e.value), 
                ...scenes.value.objects.map(e => e.list).flat().filter(e => e.value)
            ]);
        })
    }

    const pickAllGroup = ()=>{
        scenes.value.group.forEach(e => e.value = false);
        scenes.value.group[0].value = true;
        updateSelectedScenes('Group');
    }

    const pickAllObject = (obj)=>{
        obj.list.forEach(e => e.value = false);
        obj.list[0].value = true;
        updateSelectedScenes('Object');
    }

    const removeScene = (scene)=>{
        scene.value = false;
        updateSelectedScenes();
    }

//only
    const checkValid = ()=>{
        if(!drop.value)return;

        let obj = [
            ...filteredScenes.value.group || [],
            ...filteredScenes.value.objects.map(e => e.list).flat()
        ].find(e => e.title.toLowerCase() == search.value?.toLowerCase());

        confirm(obj);
    }

    const confirm = (obj)=>{
        console.log(obj)
        search.value = obj?.title || '';
        emit('update:modelValue', obj?[obj]:[]);
        if(obj?.title != search.value )emit('change', obj);
        setTimeout(()=>drop.value = false);
    }

    const pString = (sceneToConvert)=>(sceneToConvert.list?sceneToConvert.list.map(e => e.p):[sceneToConvert.p]).map(e => `p${e[0]}p${e[1]}`).join('')
</script>

<style lang="scss" scoped>
    .wr{
        width: 377px;
    }

    .tags {
        display: flex;
        margin-bottom: 8px;
        gap: 8px;
        flex-wrap: wrap;
    }

    .search-wr{
        position: relative;

        .drop-ico{
            height: 100%;
            width: 30px;
            @include flex-c;
            color: var(--bg-border-focus);
            cursor: pointer;
            border-left: 1px solid var(--bg-border);

            .ico{
                transition: .3s;
            }
        }

        &[drop]{
            .drop-ico .ico{
                rotate: .5turn;
            }
        }

        .drop{
            position: absolute;
            left: 0;
            top: 100%;
            background: var(--bg-default);
            padding: 1px 0;
            width: 100%;
            border-radius: 0 0 5px 5px;
            box-shadow: (0 0 5px #00000040);
            max-height: 40vh;
            overflow-y: auto;
            z-index: 5;
            transition: .3s;

            &[bottom]{
                top: unset;
                bottom: 100%;
                border-radius: 5px 5px 0 0;
            }

            .drop-title{
                font-size: 12px;
                padding: 16px 10px 8px;
                border-bottom: 1px solid var(--bg-border);
                color: var(--typo-secondary);
                @include text-overflow;
            }

            .item{
                padding: 5px 10px;
                cursor: pointer;
                word-break: break-word;
                text-align: left;
                display: flex;
                gap: 10px;

                &:hover{
                    background: #f5f5f5;
                }

                label span{
                    font-size: 16px;

                    &::before, &::after{
                        transform: translateY(2px);
                    }
                }

                .tick{
                    margin: 4px 0;
                }
            }
        }

        &:not([drop]) .drop{
            @include hidden(-10px);
        }
    }
    
</style>