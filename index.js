

const answer = document.getElementById('answer')
const question = document.getElementById('question')

app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.render("index");
});

button.addEventListener('click', function(){
    answer.style.display = 'block'
    question.style.color = '#1434A4'
    question.style.backgroundColor = '#68e1fd'
})

setTimeout(function(){
    console.log('Lima!')
}, 3000)