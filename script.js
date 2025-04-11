const themetoggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY ="use token here";

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
  ];

(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themetoggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}) ();


const toggleTheme = () => {
 const isDarkTheme = document.body.classList.toggle("dark-theme");
 localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themetoggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculateWidth = Math.round(width * scaleFactor);
    let calculateheight = Math.round(height * scaleFactor);

    calculateWidth = Math.floor(calculateWidth / 16) * 16;
    calculateheight = Math.floor(calculateheight / 16) * 16;

    return { width: calculateWidth, height: calculateheight };
};

const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if(!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}"  class="result-img" />
  <div class="img-overlay">
      <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
          <i class="fa-solid fa-download"></i>
      </a>
  </div>`;
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
   const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
   const { width, height } = getImageDimensions(aspectRatio);
   generateBtn.setAttribute("disabled", "true");

   const imagePromises = Array.from({length: imageCount}, async(_, i) => {

    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: {width, height},
         options: { wait_for_model: true, user_cache: false },
        }),
      
      });

      if(!response.ok) throw new Error((await response.json())?.error);
  
      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
      console.log(result);
     } catch (error){
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status.text").textContent = "Generation failed Check console for more details.";
     }
   })

   await Promise.allSettled(imagePromises);
   generateBtn.removeAttribute("disabled");
};

const createImageCards = (selectModel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += ` <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
            <div class="spinner"></div>
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p style="color: white;" class="status-text">Generating...</p>
        </div>
      
    </div>`;
   }

  generateImages(selectModel, imageCount, aspectRatio, promptText); 
};

const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectModel = modelSelect.value;
    const aspectRatio = ratioSelect.value || 1;
    const imageCount = parseInt(countSelect.value);
    const promptText = promptInput.value.trim();

    createImageCards(selectModel, imageCount, aspectRatio, promptText);

};

promptBtn.addEventListener("click", () => {
const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
promptInput.value = prompt;
promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);

themetoggle.addEventListener("click", toggleTheme);
