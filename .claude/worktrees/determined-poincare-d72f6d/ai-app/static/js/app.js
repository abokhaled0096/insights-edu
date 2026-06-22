document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("startSessionForm");

if(form){

form.addEventListener("submit", async function(e){

e.preventDefault();

const courseId = document.getElementById("courseId").value;

if(!courseId){
alert("Choose course");
return;
}

const res = await fetch("/start-session",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
courseId:courseId
})
});

const data = await res.json();

if(data.success){
location.reload();
}else{
alert("Failed");
}

});

}

});