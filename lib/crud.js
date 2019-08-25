const fs = require('fs');

// Promisifying all our callback functions
const {promisify} = require('util');
const promisedReadFile = promisify(fs.readFile);
const promisedOpenFile = promisify(fs.open);
const promisedWriteFile = promisify(fs.writeFile);
const promisedCloseFile = promisify(fs.close);
let crud = {}
let fileToManipulate = "./.data/students.json"; // This is more like our database, where every student's data is stored

// The crud.create function  helps to create a new student and insert it in our student.json file
crud.create = (dataToCreate, callBack)=> {
    promisedReadFile(fileToManipulate, "utf-8")
        .then(value => {
            let fileObject = JSON.parse(value);
            let stud = fileObject.find(s => s.regNo == dataToCreate.regNo);
            if(stud){
                return callBack(value= false, {statusCode: 404, statusMessage: "The student you want to create is already in the database"})
            }else{
                fileObject.push(dataToCreate);
                let dataToStore = JSON.stringify(fileObject, null, 2)
                
                console.log("value")
                promisedWriteFile(fileToManipulate, dataToStore)
                .then(value => {
                    callBack(value = true, {statusCode:200, statusMessage: "The student data have been loaded to database successfully"})
                 }).catch((err)=> {
                     callBack(value= false, {statusCode: 404, statusMessage: err})
                 });
            }
        })
}

// The read method is used to get both a single user or all the user depending, if u pass a query with the student's reg No, 
// It will return a single user, else , it will return all the users in the database

crud.read = (allStudents, studentRegNo, callBack) => {
    if(allStudents == true){
        promisedReadFile(fileToManipulate, "utf-8")
            .then(value => {
                callBack( true, {statusCode:200, statusMessage: "This is the list of all the users"}, value)
            })
            .catch(err => {
                callBack( false, {statusCode: 404, statusMessage: err})
            })
    }else{
        promisedReadFile(fileToManipulate, "utf-8")
            .then(value => {
               let objData = JSON.parse(value);
               let deStudent = objData.find(see => see.regNo == studentRegNo);
               return new Promise((resolve, reject) => {
                   if(deStudent){
                       resolve(deStudent);
                   }else{
                       reject(new Error("The user student with that regNo is not in our database"))
                   }
               })
            }).then(value => {
                callBack( true, {statusCode:200, statusMessage: "This is the user"}, JSON.stringify(value))
            }).catch((err)=> {
                callBack( false, {statusCode: 404, statusMessage: "The student with that regNo is not in our database"})
            })

    }
}

// This function updates the user
crud.update =  (studentRegNo, newUpdate, callBack) => {
   promisedReadFile(fileToManipulate, "utf-8")
        .then(value => {
            value = JSON.parse(value);
            const validStudent = value.find( stud => stud.regNo == studentRegNo);
            let haveAllProperties = false;
            if(validStudent){
                if(newUpdate.name && newUpdate.age && newUpdate.regNo && newUpdate["G.P"] && newUpdate.faculty){
                    haveAllProperties = true
                }else{
                    haveAllProperties = false;
                }
                if(haveAllProperties == false){
                    callBack({statusCode: 404, statusMessage: "Properties do not match the one in the database"})
                }else{
                    validStudent.name = newUpdate.name;
                    validStudent.age = newUpdate.age;
                    validStudent.regNo = newUpdate.regNo;
                    validStudent["G.P"] = newUpdate["G.P"];
                    validStudent.faculty = newUpdate.faculty;
                    let dataToFile = JSON.stringify(value, null, 2);
                    promisedWriteFile(fileToManipulate, dataToFile)
                        .then(value => {
                            callBack({statusCode: 200, statusMessage: "File Updated Successfully"})
                        }).catch(err => {
                            callBack({statusCode: 404, statusMessage: "There was an error trying to write to update your data, try again."})
                        })
                }
            }else{
                callBack({statusCode: 404, statusMessage: "Sorry, we cant find your data in the database"})
            }
        })
}

// This function delete a user
crud.delete = (regNo, callBack) => {
    promisedReadFile(fileToManipulate, 'utf8')
        .then(value => {
            value = JSON.parse(value);
            let found = false
            for(let i = 0 ; i < value.length; i++){
                if(value[i].regNo == regNo){
                    found = true;
                    value.splice(i,1);
                }
            }
            if(found){
                let valueToFile = JSON.stringify(value, null, 2);
                promisedWriteFile(fileToManipulate, valueToFile)
                .then( value => {
                    return callBack({statusCode: 200, statusMessage: "Successfully delete the user from the database"});
                })
                .catch(err => {
                    callBack({statusCode: 200, statusMessage: err})
                })
            }else{
                return callBack({statusCode: 404, statusMessage: "Could not find the user in the database"})
            }
        })
}


module.exports.crud = crud
