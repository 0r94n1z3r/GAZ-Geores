import {sendAPI} from './api.js';

const Funcs = {
    add: (type, obj, cb=()=>{}, cbErr=()=>{})=>{
        sendAPI(
            'post',
            `/projects/${type}s/`,
            obj,
            cb,
            cbErr
        )
    },

    edit: (type, id, obj, cb=()=>{}, cbErr=()=>{})=>{

        sendAPI(
            'patch',
            `/projects/${type}s/${id}/`,
            obj,
            cb,
            cbErr
        )
    },

    get: (type, id, cb)=>{
        sendAPI(
            'get',
            `/projects/${type}s/${id}/`,
            null,
            cb
        )
    },

    getAll: (type, cb)=>{
        sendAPI(
            'get',
            `/projects/${type}s/`,
            null,
            cb
        )
    },

    delete: (type, id)=>{
        sendAPI(
            'delete',
            `/projects/${type}s/${id}/`,
            null
        )
    },

    clone: (type, id, cb)=>{
        console.log(type, id)
        sendAPI(
            'post',
            `/projects/${type}s/${id}/clone_object/`,
            null,
            cb
        )
    }
}

const Project = {
    add: (obj, cb)=>Funcs.add("project", obj, cb),
    edit: (id, obj, cb=()=>{})=>Funcs.edit("project", id, obj, cb),
    get: (id, cb)=>Funcs.get("project", id, cb),
    getAll: (cb)=>Funcs.getAll("project", cb),
    delete: (id, cb)=>sendAPI(
        'patch',
        `/projects/projects/${id}/`,
        {"archived": true},
        cb
    ),
    clone: (id, cb)=>Funcs.clone("project", id, cb),
    addFromFile: (file, cb, cbErr)=>sendAPI(
        'post',
        `/projects/projects/import/`,
        {file},
        cb,
        cbErr,
        'multipart/form-data'
    ),
}

const Sensor = {
    add: (obj, cb)=>Funcs.add("sensor", obj, cb),
    edit: (id, obj, cb=()=>{})=>Funcs.edit("sensor", id, obj, cb),
    delete: (id)=>Funcs.delete("sensor", id),
    clone: (id, cb)=>Funcs.clone("sensor", id, cb)
}

const Layer = {
    add: (obj, cb)=>Funcs.add("layer", obj, cb),
    edit: (id, obj, cb=()=>{})=>Funcs.edit("layer", id, obj, cb),
    delete: (id)=>Funcs.delete("layer", id),
    clone: (id, cb)=>Funcs.clone("layer", id, cb)
}

export default {
    Project,
    Sensor,
    Layer,
}

































