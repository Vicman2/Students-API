function validdateRegNo(value){
   if(!isNaN(parseInt(value)) && value.length == 10){
       return true
   }else{
       return false;
   }
}


module.exports = validdateRegNo;