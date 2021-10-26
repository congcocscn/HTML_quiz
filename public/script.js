let studentAnswer = {};
let id = null;
let ansOrderNumer = 0;

//====================================================================================================
/**
 * fetch data from API
 */
async function getData(st_ansID, answer) {
    let url = "/attempts";
    const post = { method: "POST", headers: { "Content-Type": "application/json"}};
    if (answer) {
        post.body = JSON.stringify({answers: studentAnswer});
    }
    if (st_ansID) {
        url = `/attempts/${st_ansID}/submit`;
    }
    let response = await fetch(url, post);
    let data = await response.json();
    return data;
}

//====================================================================================================
/**
 * start button
 */
async function startButton() {
    document.getElementById('introduction').style.display = 'none';
    questionsForm();
}

//====================================================================================================
async function questionsForm() {
    const data = await getData();
    id = data._id;
    let attempt_quiz = document.getElementById('attempt-quiz');
    let submit_box = document.createElement('div');
    submit_box.classList.add('submit-box');
    let submit_button = document.createElement('button');

    //show question make by assignQues()
    let len = data.questions.length;
    let quesNum = 1;
    for ( let i = 0; i < len; i-=-1) {
        attempt_quiz.appendChild(assignQues(len, data.questions[i], quesNum));
        quesNum -=- 1;
    }
    /**
     * <div class = 'submit-box'>
     *      <button id = 'button' class = 'submit-button'>Submit your answers ❯</button>
     * </div>
     */
    submit_button.setAttribute('id', 'button');
    submit_button.classList.add('submit-button');
    submit_button.textContent = "Submit your answers ❯";

    /**
     * create window confirm
     * if ok:
     *      end quiz, review
     * else
     *      continue quiz
     */
    submit_button.addEventListener('click', function() {
        if(confirm('Are you sure to finish this quiz?')) {
            //hidden submit button
            document.querySelector('.submit-button').style.display = 'none';
            reviewQuiz();
        }
    });
    attempt_quiz.appendChild(submit_box);
    submit_box.appendChild(submit_button);
}

//====================================================================================================
/**
 * <div>
 *      <h2 id = "quesTitle">
 *          Question x of 10
 *      </h2>
 *      <h4 id = "quesName">
 *          data.questions.text
 *      </h4>
 *      <div>
 *          data.answers
 *      </div> 
 * <div>
 */
function assignQues(len, ques, quesNum) {

    let form = document.createElement('div');
    let quesTitle = document.createElement('h2');
    let quesName = document.createElement('div');
    let ansLabel = document.createElement('div');
    form.appendChild(quesTitle);
    form.appendChild(quesName);
    form.appendChild(ansLabel);
    
    quesTitle.setAttribute('id', 'quesTitle');
    quesTitle.textContent = `Question ${quesNum} of ${len}`;

    quesName.setAttribute('id', 'quesName');
    quesName.textContent = `${ques.text}`;


    // assign 4 answers into ansLabel
    for (let i = 0; i < ques.answers.length; i-=-1) {
        ansLabel.appendChild(assignAns(ques, i));
    }
    return form;
}

//====================================================================================================
/**
 * <div class = "ansForm" >
 *      <input type = "radio" id = "data.answers._id" name = "ansOrderNumer" value = "x" >
 *      <label for="ansOrderNumer">
 *          <span class = "answer">
 *              data.answers[x]
 *          </span>
 *      </label>
 * </div>
 * 
 */
function assignAns(ques, x) {

    studentAnswer[ques._id] = null;

    //answer label form
    let form = document.createElement('div');
    let ans_label = document.createElement('label');
    let ans_input = document.createElement('input');
    let ans_span = document.createElement('span');
    ans_label.appendChild(ans_span);
    form.appendChild(ans_input);
    form.appendChild(ans_label);

    form.classList.add('ansForm');
    ans_span.classList.add('answer');
    ans_span.textContent = ques.answers[x];
    ans_label.htmlFor = `ans${ansOrderNumer}`;
    
    ans_input.setAttribute('type', 'radio');
    ans_input.setAttribute('id', `ans${ansOrderNumer}`);
    ans_input.setAttribute('name', `${ques._id}`);
    ans_input.setAttribute('value', `${x}`);

    ans_input.addEventListener('click', function(event) {
        studentAnswer[event.target.name] = event.target.value;
    });
    ansOrderNumer -=- 1;
    return form;
}

//====================================================================================================
async function reviewQuiz() {

    const data = await getData(id, studentAnswer);
    
    // make result form
    let review_quiz = document.getElementById('review-quiz');
    
    //disable all answer
    for (let i = 0; i < ansOrderNumer; i-=-1) {
        document.getElementById(`ans${i}`).disabled = true;
    }

    //highlight correct and wrong answers
    for (let i in studentAnswer) {
        highlightAns(i, data.correctAnswers);
    }
    //create result view
    review_quiz.appendChild(result(data.score, data.scoreText));
    
}

//====================================================================================================
function highlightAns(id, correctAns) {

    /**
     * <div class = "correct"> Correct Answer </div>
     */
    let correct = document.createElement('div');
    correct.textContent = "Correct Answer";
    correct.classList.add('correct');

    /**
     * <div class = "wrong"> Wrong Answer </div>
     */
    let wrong = document.createElement('div');
    wrong.textContent = "Wrong Answer";
    wrong.classList.add('wrong');

    let stAnswerValue = document.querySelectorAll(`input[name='${id}']`)[studentAnswer[id]];
    let correctAnswerValue = document.querySelectorAll(`input[name='${id}']`)[correctAns[id]];

    /**
     * set all correct answer with background '#ddd' and set correct label 
     * if student choose correct answer
     *      reset background to '#d4edda'
     * else
     *      reset background to '#f8d7da'
     *      set wrong label
     */
    correctAnswerValue.nextElementSibling.appendChild(correct);
    correctAnswerValue.nextElementSibling.style.backgroundColor = '#ddd';
    if(studentAnswer[id] != null) {
        if(studentAnswer[id] == correctAns[id]) {
            stAnswerValue.nextElementSibling.style.backgroundColor = '#d4edda';
        } else {
            stAnswerValue.nextElementSibling.style.backgroundColor = '#f8d7da';
            stAnswerValue.nextElementSibling.appendChild(wrong);
        }
    }
}

//====================================================================================================
/**
 * <div class = 'resultBox'>
 *      <p class = 'result-title'>Result:</p>
 *      <p>`${score}/10`</p>
 *      <p>`${score*10}%`</p>
 *      <p>scoreText</p>
 *      <button id = 'buton' class = 'try-again-button'>Try again</button>
 * </div>
 */
function result(score, scoreText) {

    //result box
    let boxes = document.createElement('div');
    boxes.classList.add('resultBox');

    //result title
    let title = document.createElement('p');
    title.classList.add('result-title');
    title.textContent = 'Result:';

    //score
    let scores = document.createElement('p');
    scores.textContent = `${score}/10`;
    scores.style.fontSize = '24px';

    //score percentage
    let resultPercentage = document.createElement('p');
    resultPercentage.textContent = `${score*10}%`;
    resultPercentage.style.fontWeight = 'bold';

    //text score
    let textScores = document.createElement('p');
    textScores.textContent = scoreText;

    // Try-again button
    let tryAgain = document.createElement('button');
    tryAgain.setAttribute('id', 'button');
    tryAgain.classList.add('try-again-button');
    tryAgain.textContent = 'Try again';
    tryAgain.addEventListener('click', function() {
        location.reload();
        document.getElementById('header').scrollIntoView();
    });

    boxes.appendChild(title);
    boxes.appendChild(scores);
    boxes.appendChild(resultPercentage);
    boxes.appendChild(textScores);
    boxes.appendChild(tryAgain);

    return boxes;
}



//====================================================================================================
/**
 * start quiz
 */
function quizApp() {
    let start_button = document.querySelector('.start-button');
    start_button.addEventListener('click', startButton);
}

quizApp();

//====================================================================================================