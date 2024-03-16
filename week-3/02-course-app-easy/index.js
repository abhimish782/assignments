const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const authenticateAdmin = (req,res,next)=>{
  let {username,password} = req.headers;
  let existAdmin=ADMINS.find((admin)=> admin.username===username && admin.password === password);
  if(!existAdmin){
    res.status(404).json({message:"Authentication failed"});
  }
  else{
    next();
  }
}
// Admin routes
app.post('/admin/signup', (req, res) => {
    // check if admin already exists in admins
    // assign an id to the new admin
    // create a new admin and push in the admins array
    let newAdmin=req.body;
    const existAdmin=ADMINS.find((admin)=>admin.username==newAdmin.username&&admin.password==newAdmin.password);
    if(existAdmin){
      res.status(401).json( {"message": "Admin already exist"} ); 
    }
    else{
      newAdmin=Object.assign(newAdmin,{id:ADMINS.length+1});
      ADMINS.push(newAdmin);
      res.status(200).json({"message":"Admin created successfully"});
    }
});


app.post('/admin/login', authenticateAdmin, (req, res) => {
  res.status(200).json({"message":"admin logged in "});
});

app.post('/admin/courses',authenticateAdmin, (req, res) => {
    let course=req.body;
    let existCourse=COURSES.find((course)=>course===req.body);
    if(existCourse){
      res.status(409).send("Course already exists");
    }
    else{
      course=Object.assign({id: COURSES.length + 1}, course);
      COURSES.push(course);
      res.status(201).json({"message":"course created successfully", "courseId": course.id });
    }


});

app.put('/admin/courses/:courseId',authenticateAdmin, (req, res) => {
  let update=req.body;
  let id=req.params.courseId;
  let findCourse = COURSES.findIndex((course)=>course.id==id);
  if(findCourse===-1){
    return res.status(404).json({"message":"No course found with provided ID."})
  }
  else{
    COURSES[findCourse]={...COURSES[findCourse], ...update};
    res.status(200).json({"message":"Course updated successfully"});
  }
});

app.get('/admin/courses',authenticateAdmin, (req, res) => {
  res.status(200).json({COURSES});
});

// User routes

const authenticateUser=(req,res,next)=>{
  let {username,password}=req.headers;
  let findUser=USERS.find((user)=>(user.username === username && user.password == password));
  if(findUser){
    req.body=findUser;
    next();
  }
  else{
    res.status(401).json( {"message":"Invalid Credentials"} );
  }
}
app.post('/users/signup', (req, res) => {
  let user=req.body;
  let newUser=USERS.find((userData)=>userData.username===user.username&&userData.password===user.password);
  if(newUser){
    res.status(409).send('Username is taken');
  }
  else{
    
    user={...user,"purchasedCourses":[]};
    USERS.push(user);
    res.status(201).send('User Created Successfully!');
  }
});

app.post('/users/login',authenticateUser, (req, res) => {
  res.status(200).json({"message":"Logged in successfully"});
});

app.get('/users/courses', authenticateUser,(req, res) => {
  let courseToShow=COURSES.filter((course)=>course.published==true);
  res.status(200).json(courseToShow);
});

app.post('/users/courses/:courseId',authenticateUser, (req, res) => {
  let id=req.params.courseId;
  let course=COURSES.find((course)=>course.id==id);
  if(!course){
    res.status(404).send("Course Not found");
  }
  else{
    req.body.purchasedCourses.push(course);
    res.status(201).json({"message":"Course purchased successfully"});
  }
});

app.get('/users/purchasedCourses',authenticateUser, (req, res) => {
  let purchasedCourses=req.body.purchasedCourses;
  res.status(200).json({purchasedCourses});
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
