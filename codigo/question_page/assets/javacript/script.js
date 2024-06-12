document.addEventListener("DOMContentLoaded", function () {
  fetch("../json/data.json")
    .then((res) => res.json())
    .then((jsonData) => {
      displayQuestion(jsonData.DataQuestion);
      displayAnswers(jsonData.DataAnwser);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));
});

function displayAnswers(answers) {
  const tela = document.getElementById("MostrarRepostas");
  tela.innerHTML = "";

  const params = new URLSearchParams(location.search);
  const questionId = parseInt(params.get("id"));

  const answersForQuestion = answers.find((answerSet) => answerSet.question_id === questionId);
  if (answersForQuestion) {
      answersForQuestion.resposta.forEach((answer) => {
          let newDiv = document.createElement("div");
          newDiv.innerHTML = `<p>${answer}</p>`;
          tela.appendChild(newDiv);
      });
  }
}

function handleUpvote(event) {
  const questionId = event.target.getAttribute("data-id");

  const questions = JSON.parse(localStorage.getItem("questions"));

  const updatedQuestions = questions.map((question) => {
    if (question.id == questionId) {
      question.upvotes += 1;
    }
    return question;
  });

  localStorage.setItem("questions", JSON.stringify(updatedQuestions));
}

function handleDownvote(event) {
  const questionId = event.target.getAttribute("data-id");

  const questions = JSON.parse(localStorage.getItem("questions"));

  const updatedQuestions = questions.map((question) => {
    if (question.id == questionId) {
      question.downvotes += 1;
    }
    return question;
  });

  localStorage.setItem("questions", JSON.stringify(updatedQuestions));
}

function handleSaveQuestion(event) {
  const questionId = event.target.getAttribute("data-id");

  if (!localStorage.getItem("saved-questions")) {
    localStorage.setItem("saved-questions", JSON.stringify([]));
  }

  const savedQuestions = JSON.parse(localStorage.getItem("saved-questions"));

  if (savedQuestions.includes(questionId)) {
    const updatedSavedQuestions = savedQuestions.filter(
      (savedQuestionId) => savedQuestionId != questionId
    );
    localStorage.setItem(
      "saved-questions",
      JSON.stringify(updatedSavedQuestions)
    );
  } else {
    savedQuestions.push(questionId);
    localStorage.setItem("saved-questions", JSON.stringify(savedQuestions));
  }
}

function displayQuestion(question) {
  const tela = document.getElementById("MostrarPergunta");
  let params = new URLSearchParams(location.search);
  let id = parseInt(params.get("id"));
  tela.innerHTML = "";

  const pId = params.toString().indexOf("id");

  let titulo = document.createElement("div");
  titulo.innerHTML = `
        <div class="row">
        <div class="col-md-10 h3" id="titulo">${question[pId].title}</div>
        </div>
        <div class="d-inline-flex flex-wrap pb-3">
            <div>
                <img src="${question[pId].imgUrl}" id="userimg" />
                <span class="pe-4" id="userPergunta">${
                  question[pId].user
                }</span>
            </div>
            <div>
                <i class="bi bi-eye-fill h5"></i>
                <span class="pe-4" id="views">${question[pId].views}</span>
            </div>
            <div>
                <i class="bi bi-hand-thumbs-down-fill pe-1"></i>
                <span class="pe-4">${question[pId].upvotes} upvotes</span>
            </div>
            <div>
                <i class="bi bi-hand-thumbs-up-fill pe-1"></i>
                <span>${question[pId].downvotes} downvotes</span>
            </div>
            </div>
        </div>
        <div class="row">
            <div class="col-2 col-md-1" id="vote">
            <button
                type="button"
                class="btn btn-transparent"
                id="question-upVote"
                data-id="${id}"
            >
                <i class="bi bi-arrow-up-circle-fill h1 text-danger" data-id="${id}"></i>
            </button>
            <button
                type="button"
                class="btn btn-transparent text-danger"
                id="question-downVote"
                data-id="${id}"
            >
                <i class="bi bi-arrow-down-circle-fill h1" data-id="${id}"></i>
            </button>

            <button
              type="button"
              class="btn btn-transparent text-danger"
              id="question-save"
              data-id="${id}"
            >
            <i class="bi bi-box-arrow-down h1" data-id="${id}"></i>
            </button>
            </div>
            <div class="col-md-6">
            <p class="font-monospace p-3" id="questionCode">
                ${question[pId].descCodigo.replace(/\n/g, "<br />")}
            </p>
            </div>
            <div class="col-md-10">
            <span> ${question[pId].desc} </span>
            </div>
        </div>
        </div>`;
  tela.appendChild(titulo);

  const up_vote = document.getElementById("question-upVote");
  const down_vote = document.getElementById("question-downVote");
  const save_question = document.getElementById("question-save");

  save_question.addEventListener("click", handleSaveQuestion);
  up_vote.addEventListener("click", handleUpvote);
  down_vote.addEventListener("click", handleDownvote);
}

async function enviarResposta() {
  const respostaTexto = document.querySelector("#MostrarPergunta textarea[name='resposta']").value;
  const codigoResposta = document.querySelector("#MostrarPergunta textarea[name='codigo-resposta']").value;
  const questionId = parseInt(new URLSearchParams(location.search).get("id"));

  const novaResposta = {
      question_id: questionId,
      resposta: [respostaTexto]
  };

  if (codigoResposta.trim() !== "") {
      novaResposta.resposta.push(codigoResposta);
  }

  try {
      const response = await fetch("http://localhost:3000/DataAnwser", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(novaResposta)
      });

      if (response.ok) {
          console.log("Resposta enviada com sucesso");
          const jsonData = await response.json();
          displayAnswers([jsonData]);
      } else {
          console.error("Falha ao enviar resposta");
      }
  } catch (error) {
      console.error("Erro na solicitação:", error);
  }
}