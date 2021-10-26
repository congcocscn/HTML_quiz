
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const DATABASE_NAME = 'quizzapi';
const MONGO_URL = `mongodb://localhost:27017/${DATABASE_NAME}`;
let db = null;
let question = null;
let attempt = null;


async function startServer() {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db();
    question = db.collection("questions");
    attempt = db.collection("attempts");
    console.log('Database is connected!');
    app.listen(3000, function(){
      console.log('Listening on port 3000!');
  });
}

startServer();



app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

app.post('/attempts',async function (req, res){
  const ques = await question.aggregate([{$sample:{size:10}}]).toArray();
  const startedAt = Date();
  const correctAns = {};
        for(question of ques){
          correctAns[question._id] = question.correctAnswer;
          delete  question.correctAnswer;
        }
  await attempt.insertOne({questions:ques, correctAnswers:correctAns, startedAt:startedAt, completed:false, __v:0});
  const lastestAttempt = await attempt.find().limit(1).sort({$natural:-1}).toArray();
  const response = {_id:lastestAttempt[0]._id, questions:ques, score:0, startedAt:startedAt, completed:false, __v:0};
  
  console.log(response);
  res.json(response);
});

app.post('/attempts/:id/submit',async function(req, res){
  const attID = req.params.id;
  const userAnswers = req.body.answers;
  let count = 0;
  let comment = "";
  await attempt.findOne({ _id: ObjectId(attID)}, function(err, attempt) {
    for(answer in userAnswers){
      if(attempt.correctAnswers[answer] == userAnswers[answer]){
        count++;
      }
    }

    if(count <=10) {
      if(count < 5) {
        comment = "Practice more to improve it :D";
      } else if(count < 7) {
        comment = "Good, keep up!";
      } else if(count < 9) {
        comment = "Well done!";
      } else {
        comment = "Perfect!!";
      }
    }
    
    const response= {_id:attempt._id, questions:attempt.questions, answers:userAnswers, correctAnswers:attempt.correctAnswers, score:count, startedAt:attempt.startedAt, completed:true,__v:0, scoreText:comment};
    res.json(response);
  });
});







