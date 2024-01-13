import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted, watch } from "vue";

import RouterControl from "@/stores/routerControl.js";
import { useUserStore } from '@/stores/user.js';
import { useProjectStore } from '@/stores/project.js';

import mAPI from "@/script/mining.js";

export default defineStore("mining", ()=>{

    const user = useUserStore();

    const Project = useProjectStore();

//router
    const R = RouterControl();

    const router = R.router;
    const route = R.route;

//project
    const goToMiningProject = ()=>{
        R.setMiningRoute('MiningCalc', 0, Project.activeProject.id)
    }

//groups
    const groups = computed(() => Project.activeProject.mining_object_groups);
    const activeGroupId = computed(()=>route.params?.groupId);
    const activeGroup = computed(()=>groups.value?.find(e => e.id == activeGroupId.value));

    const setActiveGroupId = (groupId)=>{
        R.setMiningRoute(
            'MiningCalc',
            route.params.type,
            Project.activeProject.id,
            groupId
        )
    }

    const newGroup = ()=>{
        let obj = {
            name: 'Новая группа',
            loading: true,
            mining_objects: []
        }

        groups.value.push(obj);

        mAPI.group().add(
            {
                name: 'Новая группа', 
                project: Project.activeProject.id
            }, 
            res=>{
                Object.keys(res).forEach(k =>{
                    obj[k] = res[k];
                })
                obj.loading = false;
                setActiveGroupId(res.id)
            }
        )
    }

    const refreshStatus = (groupId) => {
        let group = groups.value.find(e => e.id == groupId);

        mAPI.group().get(
            group.id,
            res => {
                console.log(res);

                group.has_all_data = res.has_all_data; 
                group.up_to_date_calculation = res.up_to_date_calculation; 

                res.mining_objects.forEach(e => {
                    group.mining_objects.find(obj => obj.id == e.id).has_all_data = e.has_all_data;
                })
            }
        )   
    }

//objects
    const objects = computed(() => activeGroup.value?.mining_objects);
    const activeObjectId = computed(()=>route.params?.objectId);
    const activeObject = computed(()=>{
        let res = objects.value?.find(e => e.id == activeObjectId.value);
        
        if(res)activeGroup.value.drop = true;

        return res;
    });

    const allObjects = computed(()=>groups.value?.map(e => e.mining_objects).flat() || []);

    const setActiveObjectId = (groupId, objectId)=>{
        R.setMiningRoute(
            'MiningCalc',
            route.params.type,
            Project.activeProject.id,
            groupId,
            objectId
        )
    }

    const newObject = (parentGroup)=>{
        let obj = {
            name: 'Новый объект разработки',
            loading: true,
            group: parentGroup.id,
            layers: []
        }

        parentGroup.mining_objects.push(obj);

        mAPI.object().add(
            {
                name: 'Новый объект разработки', 
                group: parentGroup.id,
                layers: []
            },
            res=>{
                Object.keys(res).forEach(k =>{
                    obj[k] = res[k];
                })
                obj.loading = false;
                refreshStatus(parentGroup.id);
                setActiveObjectId(parentGroup.id, res.id);
            }
        )
    }

//LayersToObject
    const addLayersToObject = (layersIds, object)=>{
        layersIds = layersIds.concat(object?.layers)

        let arr = layersIds.length>1?new Array(...new Set(layersIds.concat([]))):layersIds;
        object = allObjects.value.find(e => e.id == object.id);

        object.layers = arr;
        
        mAPI.object().edit(
            object.id,
            {layers: arr}
        )
    }

    const removeLayersFromObject = (layersIds, object)=>{
        let arr = object.layers.filter(e => !layersIds.includes(e));
        object = allObjects.value.find(e => e.id == object.id);

        object.layers = arr;
        
        mAPI.object().edit(
            object.id,
            {layers: arr}
        )
    }


//type
    const type = computed(()=>route?.params?.type || 0);

    const setType = (type)=>{
        R.setMiningRoute(
            route.name && route.name.split('_')[0], 
            type,
            route.params.projId,
            route.params.groupId,
            route.params.objectId
        );
    }

//current
    const currentLevel = computed(()=>{
        let res = 
        activeObject.value?
        {
            level: 'Object',
            content: activeObject.value 
        }:
        activeGroup.value?
        {
            level: 'Group',
            content: activeGroup.value 
        }:{
            level: 'Project',
            content: Project.activeProject
        }

        return res;
    });

//defaultValues
    const defaultValues = ref({});

    onMounted(()=>{
        mAPI.defaultValues(
            res => defaultValues.value = res
        )
    })

//
    const editMiningItem = (obj, level, content)=>{
        let handler = mAPI[level.toLowerCase()]();

        handler.edit(obj.id, content);

        Object.keys(content).forEach(key => 
            obj[key] = content[key]
        );
    }

    const deleteMiningItem = (obj, level, parentList)=>{
        let handler = mAPI[level.toLowerCase()]();

        handler.delete(obj.id, ()=>refreshStatus(obj.group || obj.id));

        if(parentList?.length)parentList.splice(parentList.map(e => e.id).indexOf(obj.id),1);
    }

//calculateResults
    const calculateResults = (group, cb=()=>{}, cbErr=()=>{})=>{
        chartScenes.value = [];

        const errHandler = (err)=>{
            group.up_to_date_calculation = false; 
            if(route.params.type == 1){
                R.setMiningRoute(
                    route.meta?.mode,
                    0,
                    route.params.projId,
                    group.id
                );
            }
            cbErr(err);
        }

        if(!group.has_all_data){
            errHandler();
            return;
        }

        mAPI.group().calculate(
            group.id,
            res => {
                group.up_to_date_calculation = true;
                cb();
            },
            errHandler
        )
    }

//results
    const chartScenes = ref([]);

    const resOverriddenLevel = ref(null)
    const resLevel = computed(()=>resOverriddenLevel.value || currentLevel.value.level);

    // const resFilters = computed(()=>defaultValues.value[resLevel.value == 'Object'?'calculation_output':'calculation_output'])
    const resFilters = computed(()=>defaultValues.value.calculation_output);
    const resGroupFilters = computed(()=>
        defaultValues.value.calculation_output_fieldsets.map(e => 
            Object.assign(
                {},
                e,
                {columns: Object.fromEntries(e.columns.map(c => [c,resFilters.value[c]]))}
            )
        )
    )
    

//----------------------------------------

    return {
        goToMiningProject,

        groups,
        activeGroupId,
        activeGroup,
        setActiveGroupId,
        newGroup,
        refreshStatus,
        
        objects,
        activeObjectId,
        activeObject,
        allObjects,
        setActiveObjectId,
        newObject,

        addLayersToObject,
        removeLayersFromObject,

        type,
        setType,

        currentLevel,

        defaultValues,
        
        editMiningItem,
        deleteMiningItem,

        calculateResults,

        chartScenes,
        resOverriddenLevel,
        resLevel,
        resFilters,
        resGroupFilters
    }

})