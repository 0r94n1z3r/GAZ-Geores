import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted, watch } from "vue";

import RouterControl from "@/stores/routerControl.js";
import { useUserStore } from '@/stores/user.js';
import { useProjectStore } from '@/stores/project.js';
import Mining from '@/stores/mining.js';

import eAPI from "@/script/economics.js";

export default defineStore("economics", ()=>{

    const user = useUserStore();

    const Project = useProjectStore();
    const M = Mining();

//router
    const R = RouterControl();

    const router = R.router;
    const route = R.route;

//defaultValues
    const defaultValues = ref({});

    onMounted(()=>{
        eAPI.defaultValues(
            res => defaultValues.value = res
        )
    })

//
    const setType = (type)=>{
        R.setGroupRoute(
            'Economics',
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
            'Economics',
            route.params.type,
            Project.activeProject.id,
            groupId
        )
    }

//model
    const activeModel = ref(null);

    const addModel = (groupId, cbErr)=>{
        activeModel.value = {
            mining_object_group: groupId,
            loading: true,
        };

        eAPI.model.add(
            groupId,
            (res)=>{
                let gr = groups.value.find(e => e.id == groupId);

                if(gr){
                    gr.economic_model = res.id;
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
            loading: true,
        };

        eAPI.model.get(
            modelId,
            (res)=>{
                activeModel.value = Object.assign(activeModel.value, res);

                eAPI.model.data.get.input(
                    activeModel.value?.id,
                    (res)=>{
                        let l = defaultValues.value.economic_input;
    
                        let dt = Object.keys(l).reduce((acc, key)=>{
    
                            let obj = JSON.parse(JSON.stringify(l[key]));

                            obj.value = 
                                res.input_data[key] || 
                                    (
                                        l[key].array?
                                        new Array(Project.activeProject.mining_n_years).fill(0):
                                        []
                                    )
                            ;

                            if(!res.input_data[key] && l[key].array)obj.value[0] = null;
    
                            if(obj.depends_on){
                                let par = acc[obj.depends_on];
    
                                if(!par){
                                    acc[obj.depends_on] = {dep: {[key]: obj}}
                                    return acc;
                                }
    
                                if(!par.dep){
                                    acc[obj.depends_on].dep = {[key]: obj};
                                    return acc;
                                }
    
                                acc[obj.depends_on].dep[key] = obj;
                                return acc;
                            }
    
                            acc[key] = obj;
                            return acc;
                        }, {});


                        activeModel.value.data = JSON.parse(JSON.stringify(defaultValues.value.economic_input_fieldsets))
                            .map(e =>
                            Object.assign(
                                e, 
                                {
                                    columns: Object.fromEntries(e.columns.map((c)=>
                                        [
                                            c,
                                            dt[c]
                                        ]
                                    ).filter(c => c[1]))
                                }
                            )
                        );
    
                        activeModel.value.loading = false;
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
        let id = groups.value.find(e => e.id == groupId)?.economic_model;
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

    const editModel = (id, content)=>{
        eAPI.model.edit(
            id,
            content
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

        activeModel,
        addModel,
        updateModel,
        updateModelByGroup,
        editModel
    }

})