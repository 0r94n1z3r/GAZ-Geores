import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project.js';

export default defineStore("router-control", ()=>{
    const Proj = useProjectStore();

    const router = useRouter();
    const route = useRoute();

    const projRoutes = [
        'GeoRes',
        'MiningCalc',
        'Economics',
        'FieldDev'
    ]

    const setRoute = (mode, type = 0, projId, sensorId, layerId)=>{
        console.log(mode, type, projId, sensorId, layerId);

        let params = {};

        //mode
            if(!mode || !projRoutes.includes(mode)){
                mode = 'GeoRes';
            }

        //type
            params.type = type;

        //projId
            if(projId == null || !Proj.projIDs.includes(projId+'')){
                projId = Proj.projIDs[0] || 0;
            }

            params.projId = projId;
            
        
        //sensorId
            if(sensorId != null)params.sensorId = sensorId;
            
        
        //layerId
            if(layerId != null)params.layerId = layerId;

        //depth
            let dep = layerId!=null?
                'Layer'
            :sensorId!=null?
                'Sensor'
            :'Project'
            
        //name
            let name = `${mode}_${dep}`;

        console.log(name, params);
        
        router.push({name, params});
    }

    const setMode = (mode)=>{
        setRoute(
            mode, 
            0,
            route.params.projId,
            // route.params.sensorId,
            // route.params.layerId
        );
    }

    const setMiningRoute = (mode, type, projId, groupId, objectId)=>{
        let params = {
            projId,
            type: type || 0
        };

        //mode
            if(!mode || !projRoutes.includes(mode))mode = 'GeoRes';

        //groupId
            if(groupId != null)params.groupId = groupId;
            
        
        //objectId
            if(objectId != null)params.objectId = objectId;


        //depth
            let dep = objectId!=null?
                    'Object'
                :groupId!=null?
                    'Group'
                :'Project';
            
        //name
            let name = `${mode}_Mining_${dep}`;
        
        console.log('mining', name, params);
        router.push({name, params});
    }

    const setGroupRoute = (mode, type, projId, groupId)=>{
        let params = {
            projId,
            type: type || 0
        };

        //mode
            if(!mode || !projRoutes.includes(mode))mode = 'GeoRes';

        //groupId
            if(groupId != null)params.groupId = groupId;

        //depth
            let dep = groupId!=null?'Group':'Project';
            
        //name
            let name = `${mode}_${dep}`;
        
        console.log('groups', name, params);
        router.push({name, params});
    }

//router
    return{
        route,
        router,
        setRoute,
        setMode,
        setMiningRoute,
        setGroupRoute
    }
})