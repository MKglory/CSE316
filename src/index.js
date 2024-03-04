import Model from './model.js';
import './model.js'

const model = new Model();
const questions = model.data.questions;
const tags = model.data.tags;
const answers = model.data.answers;


//  Converting the Date time display
function formatQuestionMetadata(postingDate) {
  const currentDate = new Date();
  const secondsInDay = 24 * 60 * 60;
  const secondsInHour = 60 * 60;
  
  const timeDifferenceInSeconds = (currentDate - postingDate) / 1000; // Convert milliseconds to seconds
  
  if (timeDifferenceInSeconds < 60) {
      return `${Math.floor(timeDifferenceInSeconds)} seconds ago`;
  } else if (timeDifferenceInSeconds < secondsInHour) {
      return `${Math.floor(timeDifferenceInSeconds / 60)} minutes ago`;
  } else if (timeDifferenceInSeconds < secondsInDay) {
      return `${Math.floor(timeDifferenceInSeconds / 3600)} hours ago`;
  } else if (currentDate.getFullYear() === postingDate.getFullYear()) { //in the same year
      return `${postingDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })} at ${postingDate.toLocaleString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}`;
  } else {
      return `${postingDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${postingDate.toLocaleString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}`;
  }
}





/*
break line--
*/




// sorting button

function sortByDate(questions){
  let sorted_questions = questions.slice();
  sorted_questions.sort((q1, q2)=>{
    return q2.askDate - q1.askDate;
  })
  return sorted_questions;
}
function sortByAnsDate(questions){
  let sorted_questions = questions.slice();
    // sort the questions base on its newest answer date
    sorted_questions.sort((q1, q2) =>{
      let q1_earliest_ans = (q1.ansIds).reduce((earliest_aid, current_aid)=>{
        let earliest_time = earliest_aid != undefined ? model.getAnswerById(earliest_aid).ansDate : null;
        let current_time = current_aid != undefined ? model.getAnswerById(earliest_aid).ansDate : null;
        if(!current_time){
          return earliest_aid;
        }
        else if(!earliest_time){
          return null;
        }
        return earliest_time < current_time ? current_aid: earliest_aid;
      },q1.ansIds[0])
      let q2_earliest_ans = q2.ansIds.reduce((earliest_aid, current_aid)=>{
        let earliest_time = model.getAnswerById(earliest_aid).length != 0 ? model.getAnswerById(earliest_aid).ansDate : null;
        let current_time = model.getAnswerById(current_aid).length != 0 ? model.getAnswerById(earliest_aid).ansDate : null;
        if(!current_time){
          return earliest_aid;
        }
        else if(!earliest_time){
          return null;
        }
        return earliest_time < current_time ? current_aid: earliest_aid;
      },q2.ansIds[0])
      if (!q1_earliest_ans){
        return 1;
      }
      else if (!q2_earliest_ans ){
        return -1;
      }
      return model.getAnswerById(q2_earliest_ans).ansDate - model.getAnswerById(q1_earliest_ans).ansDate;
    })
    return sorted_questions;
}
function filter_unanswered(questions){
  let filtered_questions = questions.slice();
  filtered_questions = filtered_questions.filter((q) =>{
    return q.ansIds == 0;
  })
  filtered_questions = sortByDate(filtered_questions);
  return filtered_questions;
}
// Three sort button in main frame
function sort_buttons(qs){

  const id_name = qs.reduce((output, q)=>{
    return output + q.qid;
  },"")
  // add buttons
  document.getElementById('sort_bottons').innerHTML =`
    <button type="button" id= "Newest_sort_${id_name}">Newest</button>
    <button type="button" id="Active_sort_${id_name}">Active</button>
    <button type="button" id="Unanswered_${id_name}">Unanswered</button>
  `;
  const handler_sortByDate = () => {
    let display_question = sortByDate(questions);
    load_questions_page(display_question);
  }
  const handler_sortByAnsDate = () => {
    let display_question = sortByAnsDate(questions);
    load_questions_page(display_question);
  }  
  const handler_filter_unanswered = () => {
    let display_question = filter_unanswered(questions);
    load_questions_page(display_question);
  }
  // sort the question base on the pose date
  document.getElementById(`Newest_sort_${id_name}`).addEventListener('click', handler_sortByDate);
  // sort base on the most recent answer date
  document.getElementById(`Active_sort_${id_name}`).addEventListener('click', handler_sortByAnsDate)
  // filter the question base on if it has answered
  document.getElementById(`Unanswered_${id_name}`).addEventListener('click', handler_filter_unanswered);
}






/*
break line--
*/







// load question frame
function load_questions_page(current_questions){  
  let questions = current_questions;
  display_all_none();
  document.getElementById('frame').style.display = 'block';
  document.getElementById('questions_button').style.backgroundColor = 'rgba(128, 128, 128, 0.478)';
  document.getElementById('num_question_frame').innerHTML = `${questions.length} ${questions.length === 1 ? 'question': 'questions'}`
  const pose_questions = document.getElementById('pose_questions');
  pose_questions.innerHTML = ""; 
  // Adding HTML content
  if (questions.length === 0){
    pose_questions.innerHTML += `
    <div id='pose' class='pose' style='border-bottom:none'>
      <h2 style='padding: 50px'>No Questions Found</h2>
    </div>`
  }
  else{
    for (const question of questions){
      pose_questions.innerHTML += `
        <div id='pose' class='pose'>
          <div class='ans_view'>
            <p>${question.ansIds.length} answers</p>
            <p>${question.views} views</p>
          </div>
      
          <div class='question'>
            <h2 id=${question.qid} style="cursor:pointer">${question.title}</h2>
            <div class='attributes'>
              <ul>
                ${(() => {
                  let content = "";
                  for (const tagId of question.tagIds){
                    let tagName = tags.find(tag => tag.tid == tagId)?.name;
                    content += `<li>${tagName}</li>`;
                  }
                  return content;
                }
                )()}
              </ul>
            </div>
          </div>
      
          <div class='pose_time'>
            <p class='name'>${question.askedBy}</p>
            <p style='font-style: italic'>asked ${formatQuestionMetadata(question.askDate)}</p>
          </div>
        </div>
      `;
    }
  }
  // Ask Question button function
  document.getElementById('askQuestion').addEventListener('click', load_ask_question_page);
  // add event to the title link
  initialize_answer_page(questions);
  sort_buttons(current_questions);

}
function load_questions_page_default(questions){
  const display_questions = sortByDate(questions);
  load_questions_page(display_questions);
}
function load_answer_page(question, new_viewer){
  display_all_none();
  if (new_viewer){
    question.views += 1;
  }
  const question_answers_page = document.getElementById('question_answers_page');
  question_answers_page.style.display = 'block';
  question_answers_page.innerHTML = "";
  // render answer page
  //add Subheader
  question_answers_page.innerHTML +=`
  <div id="question_page_subHeader" class="question_page_subHeader">
    <h3 style="flex: 1">${question.ansIds.length} ${question.ansIds.length === 1? 'answer': 'answers'}</h3>
    <h4 style="flex: 5;font-weight: bold;">
      ${question.title}
    </h3>
    <div style='flex: 2' id="askQuestion_div" class="askQuestion_div">
      <button id="ans_page_askQuestion" class="askQuestion">Ask Question</button>
    </div>
  </div>`
  //add subheader2
  question_answers_page.innerHTML +=`
    <div id="question_page_subHeader2" class="question_page_subHeader2">
      <h3 style="flex: 2">${question.views} ${question.views == 1? 'view': 'views'}</h3>
      <h3 style="flex: 10">
        ${question.text}
      </h3>
      <div class='pose_time_answer_page'>
        <p class='name'>${question.askedBy}</p>
        <p style='font-style: italic; color:grey;'>asked ${formatQuestionMetadata(question.askDate)}</p>
      </div>
    </div>`
  // add answers
  const sorted_ansId = model.getAnswerSortNewest(question);
  console.log(sorted_ansId);
  for (let qid of sorted_ansId){
    const ans = model.getAnswerById(qid);
    question_answers_page.innerHTML +=`
      <div id="answer_in_question_answer_page" class="answer_in_question_answer_page">
        <div id="answer_page_text" class="answer_page_text">
          <p>${ans.text}</p>
        </div>
        <div id="answer_page_askBy">
          <p class="ansBy">${ans.ansBy}</p>
          <p style='font-style: italic; color:grey;' >answered ${formatQuestionMetadata(ans.ansDate)}</p>
        </div>
      </div>
      `
  }
  // add button
  question_answers_page.innerHTML +=`
    <button type="button" id='answerQuestion' class="answerQuestion">
      Answer Questions
    </button>`
  document.getElementById('ans_page_askQuestion').addEventListener('click', load_ask_question_page);
  document.getElementById('answerQuestion').addEventListener('click', ()=>load_answer_question_page(question));
}
function initialize_answer_page(questions){
  for (const question of questions){ 
    // add event listener to the title in question frame
    document.getElementById(question.qid).addEventListener('click', () => load_answer_page(question, 1));
  }
}
function load_ask_question_page(){
  display_all_none();
  document.getElementById('frame').style.display = 'none';
  document.getElementById('ask_question_frame').style.display = 'block';
  var titleInput = document.getElementById('ask_question_input1');
  var textInput = document.getElementById('ask_question_input2');
  var tagsInput = document.getElementById('ask_question_input3');
  var usernameInput = document.getElementById('ask_question_input4');
  document.getElementById('post_question_button').addEventListener('click', ()=>{
    pose_question(titleInput, textInput, tagsInput, usernameInput);
  })
}
function load_answer_question_page(question){
  display_all_none();
  const answer_page_postBtn_div = document.getElementById('answer_page_postBtn_div');
  const answer_page = document.getElementById('answer_page');
  var usernameInput = document.getElementById('answer_username');
  var answerText = document.getElementById('answer_text');
  answer_page.style.display = 'block';
  // assign event listener to the spefici question button
  answer_page_postBtn_div.innerHTML = '';
  answer_page_postBtn_div.innerHTML +=`
    <button type="button" id="answer_to_${question.qid}" class="post_answer_button">Post Answer</button>
    <p style="color:crimson; margin-left: 30%; display: inline-block;">* indicates mandatory fields</p>
  `
  document.getElementById(`answer_to_${question.qid}`).addEventListener('click', ()=>{
    post_answer(usernameInput, answerText, question);
  })
}
function post_answer(usernameInput, answerText, question){
  const username = usernameInput.value;
  const answer = answerText.value;
  const username_error = document.getElementById('answer_username_error');
  const text_error = document.getElementById('answer_text_error');
  username_error.style.display = 'none';
  text_error.style.display = 'none';

  let valid = 1;
  if (username.trim() === ""){
    document.getElementById('answer_username_error').style.display = 'block';
    valid = 0;
  }
  if (answer.trim() === ""){
    document.getElementById('answer_text_error').style.display = 'block';
    valid = 0;
  }

  if (valid){
    const newAnswer = {
      aid: 'a' + (answers.length + 1),
      text: answer.trim(),
      ansBy: username.trim(),
      ansDate: new Date()
    }
    model.insertAnswer(question.qid, newAnswer);
    const inputElements = document.getElementsByClassName('answer_page_input');
    Array.from(inputElements).forEach(input => input.value = '');
    // clear input box
    document.getElementById('answer_username').value = '';
    document.getElementById('answer_text').value = '';
    load_answer_page(question, 0);
  }
}
 




/*
Break line------
*/





// for Tag frame
function tag_text_link(){
  for (let tag of tags){
    const tag_link = document.getElementById(tag.tid);
    tag_link.addEventListener('click', ()=>{
      let content = '[' + tag.name + ']';
      let searched_questions = questions.filter((q)=>is_include(q, content));
      load_questions_page_default(searched_questions);
      document.getElementById('sub_header_content').innerHTML = 'Search Results';
    })
  }
}
function load_tags_page(){
  const tags_frame = document.getElementById('tags_frame');
  // let num_tags = questions.reduce((num, question)=>{
  //   return (num + (question.tagIds.length));
  // },0)
  let num_tags = tags.length;
  tags_frame.innerHTML = "";
  //add subheader of tags
  tags_frame.innerHTML += `
    <div id="tags_header" class="tags_header">
      <h2 id="num_tags" class="num_tags">${num_tags} ${num_tags === 1 ? 'tag': 'tags'}</h2>
      <h2>All Tags</h2>
      <div id="tags_askQuestion_div" class="tags_askQuestion_div"><button id="tags_askQuestion" class="tags_askQuestion"> Ask Question</button></div>
    </div>`;

  // add tags grid wrapper
  tags_frame.innerHTML += `
    <div id="tags_container" class="tags_container">
    ${tags.map(tag => {
      // find the number of qustion with this tags
      let num_question = questions.reduce((num, question)=>{
        return (num + (question.tagIds.includes(tag.tid)?1:0));
      },0);

      return `
      <div class="tags_item">
          <a id=${tag.tid}>${tag.name}</a>
          <p>${num_question} ${num_question === 1 ? 'question' : 'questions'}</p>
      </div>
      `;
    }).join('\n')}
    </div>`

    //assign event listener to the ask question button in tags frame
    document.getElementById('tags_askQuestion').addEventListener('click', load_ask_question_page);
    // assign link to the tag text
    tag_text_link();
}








/*
break line--
*/






// for ask question page
function initialize_tags(tagList){
  let tags_id_list = new Set(); //Tid list
  for (let i = 0; i < tagList.length; i++){
    let current_tag = model.getTag(tagList[i]);
    // If it is a new tag
    if (current_tag == undefined){
      let tagId = "t" + tags.length+1;
      current_tag = {
        tid: tagId,
        name: tagList[i]
      }
      model.insertTag(current_tag);
    }
    tags_id_list.add(current_tag.tid);
  }
  return Array.from(tags_id_list);
}
function pose_question(titleInput, textInput, tagsInput, usernameInput){
  const titleError = document.getElementById('titleError');
  const textError = document.getElementById('textError');
  const tagsError = document.getElementById('tagsError');
  const usernameError = document.getElementById('usernameError');
  titleError.style.display = 'none';
  textError.style.display = 'none';
  tagsError.style.display = 'none';
  usernameError.style.display = 'none';

  let valid = 1;
  if (titleInput.value.trim() === '' || titleInput.value.length > 100) {
    titleError.style.display = 'block';
    valid = 0;
  }
  if (textInput.value.trim() === '') {
    textError.style.display = 'block';
    valid = 0;
  }
  var tagList = tagsInput.value.trim().toLowerCase().split(/\s+/);
  if (tagList.length > 5 || tagList.some(tag => tag.length > 20) || tagList.some(tag => tag.length == 0)) {
    tagsError.style.display = 'block';
    valid = 0;
  } 
  if (usernameInput.value.trim() === '') {
    usernameError.style.display = 'block';
    valid = 0;
  }
  if (valid){
    let tags_id_list = initialize_tags(tagList)
    // Create question object
    const question = {
      qid: 'q' + (questions.length+1),
      title: titleInput.value.trim(),
      text: textInput.value.trim(),
      tagIds: tags_id_list,
      askedBy: usernameInput.value.trim(),
      askDate: new Date(),
      ansIds: [],
      views: 0
    };
    model.insertQuestion(question);
      // Refresh the input content in the ask question
    const inputElements = document.getElementsByClassName('ask_question_input');
    Array.from(inputElements).forEach(input => input.value = '');
    // Refresh the question page for new question
    load_questions_page_default(questions);
  }
}






/*
break line--
*/




// Make all default display to none
function display_all_none(){
  document.getElementById('sub_header_content').innerHTML = 'All Questions';
  document.getElementById('frame').style.display = 'none';
  document.getElementById('ask_question_frame').style.display = 'none';
  document.getElementById('tags_button').style.backgroundColor = 'transparent';
  document.getElementById('questions_button').style.backgroundColor = 'transparent';
  document.getElementById('titleError').style.display = 'none';
  document.getElementById('textError').style.display = 'none';
  document.getElementById('tagsError').style.display = 'none';
  document.getElementById('usernameError').style.display = 'none';
  document.getElementById('question_answers_page').style.display = 'none';
  document.getElementById('answer_page').style.display = 'none';
  document.getElementById('answer_username_error').style.display = 'none';
  document.getElementById('answer_text_error').style.display = 'none';
  document.getElementById('tags_frame').style.display = 'none';
  document.getElementById('search_bar').value = '';
}
function initialize_searchBar(){
  const search = document.getElementById('search_bar');
  search.onkeyup = search_enter;
}
function is_include(question, string){
  const text = question.text.toLowerCase()
  const title = question.title.toLowerCase();
  const tags = question.tagIds.map(tid =>{
    return model.getTagById(tid).name;
  })
  string = string.toLowerCase();
  let stringList = string.split(/\s+/);
  const search_tags = stringList.filter(e => {
    return e.startsWith('[') && e.endsWith(']');
  })
  const search_text = stringList.filter(e => {
    return !(e.startsWith('[') && e.endsWith(']'));
  })
  // check text and title
  let is_search_text_match = search_text.every((word) => {
    return (text.includes(word) || title.includes(word));
  });
  // check tag
  for (let search_tag of search_tags){
    if (tags.includes(search_tag.slice(1,-1))){
      return true;
    }else{
      return false;
    }
  }
  if (is_search_text_match == 1){
    return true;
  }

  return false;
}
function search_enter(event){
  if (event.keyCode == 13){
    let content = document.getElementById('search_bar').value;
    let searched_questions = questions.filter((q)=>is_include(q, content));
    load_questions_page_default(searched_questions);
    document.getElementById('sub_header_content').innerHTML = 'Search Results';

  }
}




/*
break line--
*/






// Add function for the nav manu button
function navigator_function(){
  // for Question button 
  document.getElementById('questions_button').addEventListener('click', ()=>{
    display_all_none();
    load_questions_page_default(questions);
    document.getElementById('questions_button').style.backgroundColor = 'rgba(128, 128, 128, 0.478)';
    document.getElementById('frame').style.display = 'block';
    document.getElementById('ask_question_frame').style.display = 'none';

  })
  // for Tags Button
  document.getElementById('tags_button').addEventListener('click', ()=>{
    display_all_none()
    load_tags_page();
    document.getElementById('tags_button').style.backgroundColor = 'rgba(128, 128, 128, 0.478)';
    document.getElementById('frame').style.display = 'none';
    document.getElementById('ask_question_frame').style.display = 'none';
    document.getElementById('tags_frame').style.display ='block';
  })
}

function Fake_Stack_Overflow(){
  // load Default page
  navigator_function();
  load_questions_page_default(questions);
  // sort_buttons(questions);
  initialize_searchBar()
}

window.onload = function() {  
  Fake_Stack_Overflow();
}
