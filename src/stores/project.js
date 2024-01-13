import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted, watch } from "vue";

import RouterControl from "@/stores/routerControl.js";
import { useUserStore } from '@/stores/user.js';

import APIstruct from '@/script/structure.js';

export const useProjectStore = defineStore("project", ()=>{

    const user = useUserStore();

//router
    const R = RouterControl();

    const router = R.router;
    const route = R.route;

//projects
    const projects = ref([
        // {
        //     "id": 0,
        //     "name": "Какой-то проект 1",
        //     "description": "Описание проекта",
        //     "sensors": [
        //         {
        //             "id": 0,
        //             "name": "Ловушка 1",
        //             "layers": [
        //                 {
        //                     "id": 1,
        //                     "name": "Пласт 11",
        //                     "fluid_type": "empty" //gas //oil
        //                 }
        //             ]
        //         },
        //     ]
        // },
    ]);

    const activeProjectId = computed(()=>route.params?.projId);
    const activeProject = computed(() => projects.value.find(e => e.id == activeProjectId.value) || projects.value[0] || {});
    const activeProjectDisplay = computed(() => activeProject.value.id != null?activeProject.value:null);

    const projIDs = computed(() => projects.value.map(e => e.id+''));

    const setActiveProjectId = (id)=>{
        R.setRoute(
            route.name && route.name.split('_')[0],
            route.params.type,
            id
        )
    }

    watch(()=>activeProject.value.id, (n)=>{
        let proj = projects.value.find(e => e.id == n);

        if(!proj?.loading)return;

        APIstruct.Project.get(
            n,
            (res)=>{
                Object.assign(projects.value.find(e => e.id == n), res, {loading: false});
            }
        )
    })

    const goToSameProject = ()=>{
        R.setMode(route.meta.mode);
    }

    const newProject = ()=>{
        router.push({name: 'New'});
    };

    //back
        const projectsLoading = ref(false)
        
        const updateProjects = ()=>{
            projectsLoading.value = true;
            APIstruct.Project.getAll((res)=>{
                projects.value = res.map(e => Object.assign({}, e, {loading: true}));
                if(!res.length)router.push({name: 'New'});
                else if(!activeProjectId.value)setActiveProjectId(projects.value?.[0]?.id);
                projectsLoading.value = false;
            });
        }

        watch(()=>user.isLogged, n=>{
            if(n)updateProjects();
        })

        const uploadProject = (project, isEdit, cbErr, file)=>{
            if(file){
                APIstruct.Project.addFromFile(
                    file, 
                    res => {
                        projects.value.push(res)
                        setActiveProjectId(res.id);

                        console.log(res);
                    },
                    cbErr
                )
            }else if(!isEdit){
                APIstruct.Project.add(
                    project, 
                    res => {
                        console.log('!!!!!!!!!',res.id);
                        projects.value.push(res)
                        setActiveProjectId(res.id);
                    },
                    cbErr
                )
            }else{
                let obj = activeProject.value.id == project.id ? activeProject.value : projects.value.find(e => e.id == project.id);

                editProjectItem(obj, 'Project', {name: project.name, description: project.description});

                console.log(project)

                const editTree = (type, parentId, fromList, toList, childrenKey)=>{
                    fromList.forEach((e,k)=>{
                        if(e.id == null){
                            addProjectItem(k, e, toList, parentId);
                        }else{
                            let clone = toList.find(n => n.id == e.id);
                            if(e.name != clone.name)editProjectItem(clone, type, {name: e.name})
                            if(e.fluid_type != clone.fluid_type)editProjectItem(clone, type, {fluid_type: e.fluid_type})
                            if(childrenKey)editTree('Layer', e.id, e[childrenKey], clone[childrenKey]);
                        }
                    })

                    toList.forEach((e,k)=>{
                        if(!fromList.find(n => n.id == e.id)){
                            deleteProjectItem(e, type, toList);
                        }
                    })
                }

                editTree('Sensor', obj.id, project.sensors, obj.sensors, 'layers');

                obj.sensors = project.sensors;

                setActiveLayerId(obj.id);
            }
        }

        const editProjectItem = (object, type, changes)=>{
            for(let k in changes)object[k] = changes[k];
            APIstruct[type]?.edit(object.id, changes);
        }

        const deleteProjectItem = (object, type, parentList)=>{
            APIstruct[type]?.delete(
                object.id, 
                ()=>{
                    if(type == 'Project')setActiveProjectId(activeProjectId.value);
                }
            );
            if(parentList.length)parentList.splice(parentList.map(e => e.id).indexOf(object.id),1);
        }

//sensors / layers
    //sensors
        const sensors = computed(() => activeProject.value?.sensors);
        const activeSensorId = computed(()=>route.params?.sensorId);
        const activeSensor = computed(()=>sensors.value?.find(e => e.id == activeSensorId.value));

        const setActiveSensorId = (sensorId)=>{
            R.setRoute(
                route.name && route.name.split('_')[0],
                route.params.type,
                activeProjectId.value,
                sensorId
            )
        }

    //layers
        const activeLayerId = computed(()=>route.params?.layerId);
        const activeLayer = computed(()=>{
            let res = activeSensor.value?.layers?.find(e => e.id == activeLayerId.value);
            if(res)activeSensor.value.drop = true;
            return res;
        });

        const setActiveLayerId = (sensorId, layerId)=>{
            R.setRoute(
                route.name && route.name.split('_')[0],
                route.params.type,
                activeProjectId.value,
                sensorId,
                layerId
            )
        }

        const findLayerParent = (layerId)=>{
            let res = null;

            activeProject.value.sensors.some((e)=>{
                if(e.layers.some(l => l.id == layerId)){
                    res = e;
                    return true;
                }
                return false;
            })

            return res;
        }

        const findLayer = (layerId)=>{
            let res = null;

            activeProject.value.sensors.some((e)=>{
                return e.layers.some(l => {
                    if(l.id == layerId){
                        res = l;
                        return true;
                    }
                    return false;
                })
            })

            return res;
        }

        const allLayers = computed(()=>sensors.value?.map(e => e?.layers)?.flat() || []);
        const selectedLayers = computed(()=>allLayers.value?.filter(e => e?.selected));

        const flushSelectedLayers = ()=>{
            selectedLayers.value.forEach(e => e.selected = false);
        }


    const addProjectItem = (id, object, list, parentId, postfix) => {

        id = id === -1?list.length:id;

        object = object == "newSensor"?
            {
                "name": "Новый пласт",
                "layers": []
            }:
            object == "newLayer"?
            {
                "name": "Новая залежь",
                "fluid_type": "empty"
            }:JSON.parse(JSON.stringify(object))

        object.name += postfix || '';
        object.loading = true;
        if(object.drop)object.drop = false;
        delete object.id;

        list.splice(id, 0, object);

        let objLink = list[id];
        
        //back 
            if (object.fluid_type){
                APIstruct.Layer.add(
                    {
                        name: object.name,
                        fluid_type: object.fluid_type,
                        sensor: parentId
                    },
                    (res)=>{
                        for(let k in res)objLink[k] = res[k];
                        delete objLink.loading;
                    },
                    ()=>list.splice(id, 0)
                )
            }else{
                APIstruct.Sensor.add(
                    {
                        name: object.name,
                        project: parentId
                    },
                    (res)=>{
                        for(let k in res)objLink[k] = res[k];

                        let lrs = JSON.parse(JSON.stringify(object.layers))
                        objLink.layers = [];

                        delete objLink.loading;

                        lrs.forEach((e,k)=>{
                            addProjectItem(k, e, objLink.layers, objLink.id)
                        })
                    },
                    ()=>list.splice(id, 0)
                )
            }
    }

//CurrentLevel
    const currentLevel = computed(()=>{
        let res = 
        activeLayer.value?
        {
            level: 'Layer',
            content: activeLayer.value 
        }
        :activeSensor.value?
        {
            level: 'Sensor',
            content: activeSensor.value
        }
        :
        {
            level: 'Project',
            content: activeProject.value 
        };

        if(
            !route.name || (
                (
                    (route.name.split('_')[1] != res.level) || 
                    !projIDs.value.includes(activeProjectId.value+'')
                ) &&
                [
                    'GeoRes',
                    'MiningCalc',
                ].includes(route.name)
            )
        ){
            R.setRoute(
                route.name && route.name.split('_')[0],
                route.params.type,
                activeProjectId.value,
                activeSensor.value?.id,
                activeLayer.value?.id
            )
        }

        return res;
    });

//type
    const type = computed(()=>route?.params?.type || 0);

    const setType = (type)=>{
        R.setRoute(
            route.name && route.name.split('_')[0], 
            type,
            route.params.projId,
            route.params.sensorId,
            route.params.layerId
        );
    }

//----------------------------------------------------------------
    return {
        projects,
        activeProjectId,

        activeProject,
        setActiveProjectId,
        goToSameProject,
        activeProjectDisplay,
        projIDs,
        newProject,
        uploadProject,
        projectsLoading,
        updateProjects,
        editProjectItem,
        deleteProjectItem,

        activeSensor,
        setActiveSensorId,

        activeLayer,
        setActiveLayerId,
        findLayerParent,
        findLayer,
        allLayers,
        selectedLayers,
        flushSelectedLayers,

        sensors,
        addProjectItem,

        currentLevel,

        type,
        setType,
        
    }
})