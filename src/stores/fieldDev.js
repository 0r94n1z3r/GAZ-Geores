import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted, watch } from "vue";

import RouterControl from "@/stores/routerControl.js";
import { useUserStore } from '@/stores/user.js';
import { useProjectStore } from '@/stores/project.js';
import Mining from '@/stores/mining.js';

import fdAPI from "@/script/fieldDev.js";

export default defineStore("fieldDev", ()=>{

    const Project = useProjectStore();
    const M = Mining();

//router
    const R = RouterControl();

    const router = R.router;
    const route = R.route;

//defaultValues
    const defaultValues = ref({});

    onMounted(()=>{
        fdAPI.defaultValues(
            res => defaultValues.value = res
        )
    })

//regions (specific_costs)
    const regions = ref({});

    onMounted(()=>{
        fdAPI.regions(
            res => regions.value = res
        )
    })

//
    const setType = (type)=>{
        R.setGroupRoute(
            'FieldDev', 
            type,
            route.params.projId,
            route.params.groupId,
            route.params.objectId
        );
    }

//
    const groups = computed(()=>M.groups);
    const activeGroupId = computed(()=>route.params?.groupId);
    const activeGroup = computed(()=>groups.value?.find(e => e.id == activeGroupId.value));

    const setActiveGroupId = (groupId)=>{
        R.setGroupRoute(
            'FieldDev',
            route.params.type,
            Project.activeProject.id,
            groupId
        )
    }

//model
    const activeModel = ref(null);

    const addModel = (groupId, region, cbErr)=>{
        activeModel.value = {
            specific_cost: region,
            mining_object_group: groupId,
            loading: true,
        };

        fdAPI.model.add(
            groupId,
            region,
            (res)=>{
                let gr = groups.value.find(e => e.id == groupId);

                if(gr){
                    gr.cost_model = res.id;
                }

                updateModel(res.id, cbErr);
            },
            (err)=>{
                activeModel.value = null;
                cbErr(err);
            }
        )
    }

    const updateModel = (modelId, cbErr)=>{
        activeModel.value = {
            specific_cost: activeModel.value?.specific_cost,
            mining_object_group: activeModel.value?.groupId,
            loading: true,
        };

        fdAPI.model.get(
            modelId,
            (res)=>{
                activeModel.value = Object.assign(activeModel.value, res);
                
                fdAPI.model.data.get.input(
                    activeModel.value?.id,
                    (res)=>{
                        let l = JSON.parse(JSON.stringify(defaultValues.value.cost_input));
                        let h = JSON.parse(JSON.stringify(defaultValues.value.cost_input_fieldsets));

                        console.log(res);

                        activeModel.value.data = h.map(e => 
                            Object.assign(
                                e,
                                {
                                    columns: 
                                    Object.fromEntries(
                                        e.columns.map(c => [
                                            c, 
                                            Object.assign(l[c], {value: res.input_data[c]!=null?(l[c].boolean?!!res.input_data[c]:res.input_data[c]):null})
                                        ])
                                    )
                                }
                            )
                        );

                        activeModel.value.loading = false;

                        console.log(activeModel.value);
                    },
                    (err)=>{
                        activeModel.value = null;
                        cbErr(err);
                    }
                )
            },
            (err)=>{
                activeModel.value = null;
                cbErr(err);
            }
        )
    }

    const updateModelByGroup = (groupId, cbErr)=>{
        let id = groups.value.find(e => e.id == groupId)?.cost_model;

        if(!id){
            activeModel.value = null;
            return;
        }

        activeModel.value = {
            mining_object_group: groupId,
            loading: true,
        };

        updateModel(id, cbErr);
    }

//delete
    const deleteModel = (cbErr)=>{
        const bcpModel = JSON.parse(JSON.stringify(activeModel.value));

        activeModel.value = {
            specific_cost: bcpModel.specific_cost,
            loading: true,
        };
        
        fdAPI.model.delete(
            bcpModel.id,
            ()=>{
                groups.value.find(e => e.id == bcpModel.mining_object_group).cost_model = null;
                activeModel.value = null
            },
            err => {
                activeModel.value = bcpModel;
                cbErr(err);
            }
        )
    }

//----------------------------------------

    return {
        defaultValues,
        groups,

        setType,

        activeGroupId,
        activeGroup,
        setActiveGroupId,

        regions,

        activeModel,
        addModel,
        updateModel,
        updateModelByGroup,

        deleteModel
    }

})