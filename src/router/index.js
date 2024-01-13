import { createRouter, createWebHistory } from 'vue-router'

import EditProj from '@/views/EditProj.vue'
import GeoRes from '@/views/GeoRes.vue'
import MiningCalc from '@/views/MiningCalc.vue'
import Economics from '@/views/Economics.vue'
import FieldDev from '@/views/FieldDev.vue'

const projectRoute = (mode, component, extraPath)=>{
    return {
        path: `/${mode}${extraPath || ''}/:projId`,
        name: `${mode}_Project`,
        component,
        props: true,
        meta: {hasNav: true, mode},
        children: [
            {
                path: ':sensorId',
                name: `${mode}_Sensor`,
                component,
                props: true,
                children: [
                    {
                        path: ':layerId',
                        name: `${mode}_Layer`,
                        component,
                        props: true
                    },
                ]
            },
        ]
    }
}

const miningRoute = (mode, component, extraPath)=>{
    let meta = {hasNav: true, mode, mining: true, groups: true, staticTitle: false};

    return {
        path: `/${mode}${extraPath || ''}/:projId/mining`,
        name: `${mode}_Mining_Project`,
        component,
        props: true,
        meta: Object.assign({}, meta, {staticTitle: 'Объекты разработки'}),
        children: [
            {
                path: ':groupId',
                name: `${mode}_Mining_Group`,
                component,
                props: true,
                meta,
                children: [
                    {
                        path: ':objectId',
                        name: `${mode}_Mining_Object`,
                        component,
                        props: true,
                        meta
                    },
                ]
            },
        ]
    }
}

const groupRoute = (mode, component, extraPath, extra)=>{
    let meta = {hasNav: true, mode, groups: true, groupsOnly: true, staticTitle: false, extra};

    return {
        path: `/${mode}${extraPath || ''}/:projId/`,
        name: `${mode}_Project`,
        component,
        props: true,
        meta: Object.assign({}, meta),
        children: [
            {
                path: ':groupId',
                name: `${mode}_Group`,
                component,
                props: true,
                meta: Object.assign({}, meta, {group: true})
            },
        ]
    }
}

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    projectRoute('GeoRes', GeoRes, '/:type'),

    projectRoute('MiningCalc', MiningCalc, '/:type'),
    miningRoute('MiningCalc', MiningCalc, '/:type'),
    
    projectRoute('FieldDev', FieldDev, '/:type', {noProjectPage: true}),
    groupRoute('FieldDev', FieldDev, '/:type', {noProjectPage: true}),

    projectRoute('Economics', Economics, '/:type', {noProjectPage: true}),
    groupRoute('Economics', Economics, '/:type', {noProjectPage: true}),

    {
        path: `/edit/`,
        name: 'New',
        component: EditProj,
        props: true,
        children: [
            {
                path: ':projId',
                component: EditProj,
                name: 'Edit',
                props: true,
            }
        ]
    }
  ]
})
