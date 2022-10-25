// Classifier object and model URL
let classifier;
let imageModelURL;
let triedLoadingModel;

// Classification variables
let label;
let confidence;

// Video capture
let video;
let flippedVideo;

// Variables for picture selection
let fileSelector;
let selectedImg;

// To indicate jumpscare must be played
let playJumpscare_;
let loadAnim;
let jumpSound;
let jumpSoundPlayed;
let loading;

function preload() {
  
  // Couldn't load ml5 libraries. Force user to reload.
  if(typeof ml5 === 'undefined'){
    alert('Estamos teniendo problemas con tu internet. Vamos a recargar la página.');
    location.reload();
  }
  
  imageModelURL = prompt('Pega aquí el enlace a tu modelo');

  if(imageModelURL)
    imageModelURL += "model.json";
  else{
    imageModelURL = "https://teachablemachine.withgoogle.com/models/c8dPzDi1v/model.json";
    alert('Se usará un modelo por defecto, pero quizás no funcione tan bien.');
  }

  classifier = ml5.imageClassifier(imageModelURL);

  // Notify user if classifier is not yet ready, so they wait to play the prank
  if(!classifier){
    alert('Tu modelo está tardando en cargar. Por favor espera un poco.');
    triedLoadingModel = true;
  }
  else
    triedLoadingModel = false;
  
  loadAnim = loadImage('loading.gif');
  jumpSound = loadSound('jumpSound.mp3');
  
}

function setup() {
  
  createCanvas(displayWidth, displayHeight);
  
  fileSelector = document.getElementById('file-selector');
  
  // Gets image file
  fileSelector.addEventListener('change', (event) => {
    
    // Remove other elements
    document.getElementById("container").innerHTML = "";    
    
    loading = true;
    
    // Read file as image
    let image = event.target.files[0];
    readImage(image);
    
  });
  
  playJumpscare_ = false;
  jumpSoundPlayed = false;
  loading = false;
}

function draw() {
  
  // Indicate that jumpscare must be played once when subject gets close
    
  if(label){
    
    if(label == 'cerca' || label == 'Cerca')
      playJumpscare_ = true;
      
  }
  
  if(playJumpscare_){
    playJumpscare();
  }
  else if (selectedImg){
    displayDummyText();
  }
  else if(loading){
    image(loadAnim, displayWidth/2, 50);          
  }
  
}

function playJumpscare(){
  
  image(selectedImg,
        window.visualViewport.pageLeft,
        window.visualViewport.pageTop,
        window.visualViewport.width,
        window.visualViewport.height);
  
  if(!jumpSoundPlayed){
    jumpSound.play();
    jumpSoundPlayed = true;
  }
  
}

function displayDummyText(){
  
  background(245,187,12);
  fill('black');
  
  // Compensate user zoom by making text smaller.
  let zoom = window.visualViewport.scale; 
  let zoomDiff = 1 - zoom;
  let zoomFactor = 1 + zoomDiff
  
  let textSize_ = 4 * (zoomFactor);
  
  if (textSize_ < 1)
    textSize_ = 1;
    
  textSize(textSize_);
  
  textAlign(CENTER);
  
  let middle = window.visualViewport.pageLeft + window.visualViewport.width/2;
  

  text("La Casa Decorada: una escalofriante leyenda de Halloween", middle, 10);
  text("Nuestras primeras protagonistas fueron dos amigas de instituto que", middle, 13);
  text("acabaron convertidas en rivales en la peor de las noches, la de", middle, 16);
  text("Halloween. Ambas habían cuidado con mimo el más mínimo detalle de", middle, 19);
  text("sus disfraces de brujas y ambas también tenían preparado un auténtico", middle, 22);
  text("espectáculo terrorífico en sus casas para impresionar al jurado que", middle, 25);
  text("decidiría quién sería la familia más espeluznante.", middle, 28);
  text("La cosa estaba muy reñida, por lo que Charlotte acudió a su belleza y encantos", middle, 31);
  text("naturales para conseguir el voto masculino y ganar el primer premio al mejor", middle, 34);
  text("disfraz. Katie, como sabía de las artimañas de su amiga, se lo jugó todo a una carta:", middle, 37);
  text("su casa debía ser las más aterradora. Proyecciones de asesinos en serie sobre las", middle, 40);
  text("ventanas, 50 gatos negros maullando en su jardín, humo, esqueletos danzantes,", middle, 43);
  text("pirotécnica… Miraras donde miraras el miedo se dibujaba en la cara del jurado. Y", middle, 46);
  text("cuando parecía que nada más podía pasar, llegó el truco final.", middle, 49);
  text("Katie había preparado su propio ahorcamiento falso en el árbol de su jardín", middle, 52);
  text("para despedir al jurado. Aplausos y gritos de sorpresa envolvieron el momento. Ya", middle, 55);
  text("había ganadora. Katie fue jaleada como la triunfadora. Pero nadie pudo recoger el", middle, 58);
  text("premio. Algo había fallado con el truco de cuerdas y sistemas de seguridad y las", middle, 61);
  text("convulsiones de su cuerpo no habían sido teatro. Katie estaba muerta. Este mito,", middle, 64);
  text("conocido como La Casa Decorada, nos recuerda que no todo vale para ganar y", middle, 67);
  text("que poner unos límites nos puede salvar la vida.", middle, 70);
  
}

// Get a prediction for the image received by parameter
function classifyVideo() {
  
  // Try to load model again if internet failed
  if(!classifier){
    classifier = ml5.imageClassifier(imageModelURL);
    return;
  }
  else if (triedLoadingModel){
    alert('Listo! Gracias por esperar. Ya puedes asustar a esa persona 😈.');
    triedLoadingModel = false;
  }
  
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
}

// When we get a result
function gotResult(error, results) {
  
  label = results[0].label;
  confidence = results[0].confidence;
  setTimeout(classifyVideo, 100);
  
}

// To read the image uploaded
function readImage(file) {
  
  // Notify user that the file uploaded is not an image
  if (file.type && !file.type.startsWith('image/')) {
    alert('Hmm, parece que esta no es una imagen, intenta con otra.');
    return;
  }

  const reader = new FileReader();
  
    // Save image to be displayed at the jumpscare
    reader.addEventListener('load', (event) => {
    
    loading = false;
    selectedImg = loadImage(event.target.result);
    
    let ratio = selectedImg.height/selectedImg.width;
    
    // Create capture after uploading file, so that mobile users can take pictures of themselves
    video = createCapture(
      {video:{
        facingMode: "user"  
      }
    });
    video.hide();
      
    // Start classifying video only when everything is ready
    
    setTimeout(function(){
      flippedVideo = ml5.flipImage(video);
      classifyVideo();
    },2000);
      
  });
  
  reader.readAsDataURL(file);
  
}
