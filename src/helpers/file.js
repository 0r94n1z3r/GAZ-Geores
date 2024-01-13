export const readJSON = (file, cb)=>{
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = ()=>{
        cb(JSON.parse(reader.result));
    };
}