export const downloadFile = (response, filename, cb)=>{
    console.log(filename);

    const href = URL.createObjectURL(response);

    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', `${filename}`); 
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    cb();
}