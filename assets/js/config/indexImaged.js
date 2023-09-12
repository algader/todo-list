const { ipcRenderer } = require ("electron");
const connection = require ("./connection");
const fs = require('fs');

let newImaged = document.querySelector(".todo--images .add-new-task");

newImaged.addEventListener("click", function() {
    ipcRenderer.send("new-imaged");
});;

ipcRenderer.on('add-imaged-task', function(e, note, imgURI ) {
    addImagedTask(note, imgURI);
});

function addImagedTask(note, imgURI) {
    connection.insert({
        into: 'imaged',
        values: [{
            note: note,
            img_uri: imgURI
        }]
    }).then(() => showImaged());
}

function deleteImagedTask(taskId, imgURI) {
    if (imgURI) {
        fs.unlink(imgURI, (err) => {
            if (err) {
                console.error(err)
                return
            }
        });
    }
    return connection.remove({
        from: 'imaged',
        where: {
            id: taskId
        }
    }).then(() => showImaged());
}


function updateImagedTask(taskId, taskValue) {
    connection.update({
        in: 'imaged',
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    }).then(() => showImaged());
}



function showImaged(){
    let clearImagedBtn = document.querySelector(".todo--images .clear-all");
    let imagedList = document.querySelector(".todo--images__list");
    imagedList.innerHTML = '';

    connection.select({
        from: 'imaged'
    }).then((tasks) => {
        if (tasks.length == 0) {
            imagedList.innerHTML = '<li class="empty-list">لا توجد مهام</li>';
            clearImagedBtn.classList.remove("clear-all-show");
        }else{
            clearImagedBtn.classList.add("clear-all-show");
            clearImagedBtn.addEventListener("click", function () {
                return connection.remove({
                    from: 'imaged'
                }).then(() => showImaged())
            });
            for(let task of tasks){
                clearImagedBtn.addEventListener("click", function(){
                    fs.unlink(task.img_uri, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    });
                });
                let listItem = document.createElement("li"),
                taskInput = document.createElement("input"),
                imageHolder = document.createElement("div"),
                taskImage = document.createElement("img"),
                deleteBTN = document.createElement("button"),
                buttonsHolder = document.createElement("div"),
                noteContentHolder = document.createElement("div"),
                updateBTN = document.createElement('button'),
                exportBTN = document.createElement('button');
               
                taskInput.value = task.note; 
                buttonsHolder.classList.add("buttons-holder");

              
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                taskImage.setAttribute("src", task.img_uri);

                deleteBTN.addEventListener("click", function(){
                    deleteImagedTask(task.id, task.img_uri);
                });

                updateBTN.addEventListener("click", function(){
                    updateImagedTask(task.id, taskInput.value);
                });

                exportBTN.addEventListener("click", function () {
                    ipcRenderer.send("create-txt", task.note);
                });

                
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
                noteContentHolder.appendChild(taskInput); 
                noteContentHolder.appendChild(buttonsHolder);
                imageHolder.appendChild(taskImage);
                listItem.appendChild(noteContentHolder);
                listItem.appendChild(imageHolder);
              
                imagedList.appendChild(listItem);
            }
        } 
    });
}

showImaged();






