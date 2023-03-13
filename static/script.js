var players = [];

// leggiamo il file "players.csv"
async function leggiCSV() {
  const response = await fetch('static/players.csv');
  const data = await response.text();
  const rows = data.split('\n');
  rows.shift();
  rows.forEach(row => {
    const cols = row.split(';');
    players.push({
      fullName: cols[0],
      imageName: cols[1],
      relatedWords: [cols[2], cols[3], cols[4], cols[5], cols[6]],
      used: false
    });
  });
}

const turno1 = document.querySelector(".turno-squadra-1");
const turno2 = document.querySelector(".turno-squadra-2");
const gioco = document.querySelector(".gioco");

let countdown = 60.0;
let currentlyPlaying = 0;

const parte1 = document.querySelector(".parte1");
const parte2 = document.querySelector(".parte2");
let cerchio = document.querySelector(".cerchio");
let cerchioOriginale = cerchio.cloneNode(true);


var front = document.querySelector(".front")
var playerName = document.getElementById("playerFullName");
var playerImage = document.getElementById("playerImage");
var forbiddenWords = document.getElementById("list-forbidden-words");

var correctAudio = null;
var wrongAudio = null;
var passAudio = null;

var passValue = 2;
document.getElementById("pass-counter-value").innerHTML = passValue;

cerchio.classList.add("animate");

function upgradeCurrentlyPlaying() {
  currentlyPlaying = currentlyPlaying === 0 ? 1 : 0;
}

function schermataPreGiocaSquadra1() {
  turno1.style.display = "block";
  turno2.style.display = "none";
  gioco.style.display = "none";
}

function schermataPreGiocaSquadra2() {
  turno1.style.display = "none";
  turno2.style.display = "block";
  gioco.style.display = "none";
}

function gioca() {
  countdown = 60.0;
  
  $("#fail").prop("disabled", false);
  $("#pass").prop("disabled", false);
  $("#correct").prop("disabled", false);

  //reimposto i passo
  passValue = 2;
  document.getElementById("pass-counter-value").innerHTML = passValue;

  //pesco un giocatore non ancora utilizzato dalla lista e cambiamo il contenuto degli oggetti
  updateHTMLWithNewPlayer();

  turno1.style.display = "none";
  turno2.style.display = "none";
  gioco.style.display = "block";
  
  startTimer();
}

function resetCerchio() {
  cerchio.replaceWith(cerchioOriginale.cloneNode(true));
  cerchio = document.querySelector(".cerchio");
}

function startTimer() {
  setTimeout(() => {
    const updateCountdown = () => {
      countdown -= 0.1;

      if (countdown <= 0.0) {
        clearInterval(interval);
        cerchio.style.backgroundColor = "#DE1A1A";
        cerchio.textContent = "0.0";
        cerchio.classList.remove("animate");
        setTimeout(() => {
          cerchio.textContent = "STOP";
          cerchio.style.color = "#DBD3D8";

          $("#fail").prop("disabled", true);
          $("#pass").prop("disabled", true);
          $("#correct").prop("disabled", true);

          setTimeout(() => {
            upgradeCurrentlyPlaying();
            currentlyPlaying === 0 ? schermataPreGiocaSquadra1() : schermataPreGiocaSquadra2 ();
            resetCerchio()
          }, 5000);
        }, 200);
      } else {
        cerchio.textContent = countdown.toFixed(1).toString();
        if (countdown <= 10.0) {
          cerchio.classList.add("orange");
        }
      }
    };

    const interval = setInterval(updateCountdown, 100);
  }, 340);
}

function buildRelatedWords(relatedWords) {
  const word1 = relatedWords[0].toUpperCase();
  const word2 = relatedWords[1].toUpperCase();
  const word3 = relatedWords[2].toUpperCase();
  const word4 = relatedWords[3].toUpperCase();
  const word5 = relatedWords[4].toUpperCase();
  const final = `<li><div> ${word1} </div></li>` + `<li><div> ${word2} </div></li>` +
  `<li><div> ${word3} </div></li>` + `<li><div> ${word4} </div></li>` + 
  `<li><div> ${word5} </div></li>`;

  return final;
}

function buildImgSrc(imageName) {
  return "/static/images/" + imageName;
}

function getRandomPlayer(players) {
  // Filtra i giocatori che non sono stati usati
  const unusedPlayers = players.filter(player => !player.used);

  // Se non ci sono giocatori non usati, restituisci undefined
  if (unusedPlayers.length === 0) {
    return undefined;
  }

  // Seleziona casualmente un giocatore tra quelli non usati
  const randomIndex = Math.floor(Math.random() * (unusedPlayers.length-1));
  const randomPlayer = unusedPlayers[randomIndex];
  console.log(players.indexOf(randomPlayer));

  // Imposta il campo "used" a true e restituisci il giocatore selezionato
  randomPlayer.used = true;
  return randomPlayer;
}

function pass() {
  playAudio(passAudio);

  const parteDaAggiornare = document.getElementById("pass-counter-value");
  const currentVal = parseInt(parteDaAggiornare.innerText);
  const newVal = currentVal - 1;
  if(newVal === 0) {
    $("#pass").prop("disabled", true);
  }

  parteDaAggiornare.style.transform = "rotateX(90deg)";
  parteDaAggiornare.style.opacity = "0";
  parteDaAggiornare.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out";

  setTimeout(() => {
    parteDaAggiornare.innerText = newVal;
    parteDaAggiornare.style.transform = "rotateX(0deg)";
    parteDaAggiornare.style.opacity = "1";
  }, 500);
}

function correct() {
  playAudio(correctAudio);

  const parteDaAggiornare = currentlyPlaying == 0? document.getElementById("parte1") : document.getElementById("parte2");
  const currentVal = parseInt(parteDaAggiornare.innerText);
  const newVal = currentVal + 1;

  parteDaAggiornare.style.transform = "rotateX(90deg)";
  parteDaAggiornare.style.opacity = "0";
  parteDaAggiornare.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out";

  document.body.classList.add("green-background");

  setTimeout(() => {
    parteDaAggiornare.innerText = newVal;
    parteDaAggiornare.style.transform = "rotateX(0deg)";
    parteDaAggiornare.style.opacity = "1";
    
    document.body.classList.remove("green-background");
  }, 500);
}

function fail() {
  playAudio(wrongAudio);

  const parteDaAggiornare = currentlyPlaying == 0? document.getElementById("parte1") : document.getElementById("parte2");
  const currentVal = parseInt(parteDaAggiornare.innerText);
  if(0 != currentVal) {
    const currentVal = parseInt(parteDaAggiornare.innerText);
    const newVal = currentVal - 1;
  
    parteDaAggiornare.style.transform = "rotateX(90deg)";
    parteDaAggiornare.style.opacity = "0";
    parteDaAggiornare.style.transition = "transform 0.2s ease-in-out, opacity 0.2s ease-in-out";

    document.body.classList.add("red-background");

    setTimeout(() => {
      parteDaAggiornare.innerText = newVal;
      parteDaAggiornare.style.transform = "rotateX(0deg)";
      parteDaAggiornare.style.opacity = "1";

      document.body.classList.remove("red-background");
    }, 500);
  }
  else {
    document.body.classList.add("red-background");
    setTimeout(() => {
      document.body.classList.remove("red-background");
    }, 500);
  }
}

function playAudio(audio) {
  setTimeout(() => {
    audio.play();
  }, 120);
}

const card = document.querySelector('.card');

// selezioniamo tutti i pulsanti della pagina
var passButton = document.getElementById("pass");
var failButton = document.getElementById("fail");
var correctButton = document.getElementById("correct");
var buttons = [passButton, failButton, correctButton];
for (var i = 0; i < buttons.length; i++) {
  // aggiungiamo un ascoltatore di eventi per il click
  buttons[i].addEventListener("click", function() {

    card.style.transform = 'rotateY(180deg)';
			setTimeout(function() {
				card.style.transform = 'rotateY(360deg)';
			}, 500);

    setTimeout(function() {// creiamo l'animazione per ciascun oggetto
    var fullNameAnimation = playerName.animate([{opacity: 0}, {opacity: 1}], {duration: 500, fill: "forwards"});
    var imageAnimation = playerImage.animate([{opacity: 0}, {opacity: 1}], {duration: 500, fill: "forwards"});
    var listAnimation = forbiddenWords.animate([{opacity: 0}, {opacity: 1}], {duration: 500, fill: "forwards"});

    //pesco un giocatore non ancora utilizzato dalla lista e cambiamo il contenuto degli oggetti
    updateHTMLWithNewPlayer();
    }, 500);
  });
}

function updateHTMLWithNewPlayer() {
  newPlayer = getRandomPlayer(players);

  playerName.innerHTML = newPlayer.fullName;
  playerImage.src = buildImgSrc(newPlayer.imageName);
  forbiddenWords.innerHTML = buildRelatedWords(newPlayer.relatedWords);
}

document.getElementById("correctAudio")

window.addEventListener('load', function() {
  correctAudio = document.getElementById("correctAudio");
  wrongAudio = document.getElementById("wrongAudio");
  passAudio = document.getElementById("passAudio");
});

window.addEventListener('load', function() {
  turno2.style.display = "none";
  gioco.style.display = "none";
});

window.addEventListener('load', async function() {
  await leggiCSV();
  const firstPlayer = getRandomPlayer(players);
  console.log(players.indexOf(firstPlayer));

  playerName.innerHTML = firstPlayer.fullName;
  playerImage.src = buildImgSrc(firstPlayer.imageName);
  forbiddenWords.innerHTML = buildRelatedWords(firstPlayer.relatedWords);
});