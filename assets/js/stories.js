const containers = document.querySelectorAll('.stories-container');
   
   containers.forEach((container) => {
       let isDown = false;
       let startX;
       let scrollLeft;
   
       container.addEventListener('mousedown', (e) => {
           isDown = true;
           container.classList.add('active');
           startX = e.pageX - container.offsetLeft;
           scrollLeft = container.scrollLeft;
           container.style.transition = 'none';
       });
   
       container.addEventListener('mouseleave', () => {
           isDown = false;
           container.classList.remove('active');
       });
   
       container.addEventListener('mouseup', () => {
           isDown = false;
           container.classList.remove('active');
   
           // Reaplicar a transição após o mouse ser solto
           container.style.transition = 'scroll 0.3s ease';
       });
   
       container.addEventListener('mousemove', (e) => {
           if (!isDown) return;
           e.preventDefault();
           const x = e.pageX - container.offsetLeft;
           const walk = (x - startX) * 3;
           container.scrollLeft = scrollLeft - walk;
       });
   });

document.addEventListener("DOMContentLoaded", function () {
   const stories = document.querySelectorAll(".story");

   stories.forEach(story => {
       const storyId = story.getAttribute("data-story-id");
       
       // Selecionar todas as mídias (imagens e vídeos) dentro do story
       const mediaElements = story.querySelectorAll(".story-img, video");
       
       // Obter o input correspondente pelo id
       const contentInput = document.getElementById(`content-story-${storyId}`);
       
       // Definir o valor do input como o número de mídias
       if (contentInput) {
           contentInput.value = mediaElements.length;
       }
   });
});
document.addEventListener("DOMContentLoaded", function () {
    let currentStory = 0;
    let currentMediaIndex = 0;
    const stories = document.querySelectorAll(".story");
    const modal = document.getElementById("storyModal");
    const modalMediaContainer = document.querySelector(".modal-images");
    const captionText = document.getElementById("caption");
    const progressBarContainer = document.getElementById("container-progress");
    let mediaDuration = 5000;
    let mediaTimeout;
    let numberOfProgressBars;
    let progressBars = [];
    let animationFrameId; // Para controlar a animação da barra de progresso

    function showStory(index) {
        const story = stories[index];
        if (!story) return;

        const contentStoryInput = story.querySelector(`#content-story-${index}`);
        const qtInput = document.getElementById("qt");

        if (contentStoryInput) {
            qtInput.value = contentStoryInput.value;
        }

        numberOfProgressBars = parseInt(contentStoryInput.value, 10);
        progressBarContainer.innerHTML = '';
        progressBars = [];
        addProgressBars(numberOfProgressBars);

        story.querySelector(".story-images").classList.add("story-content-viewed");
        modal.style.display = "flex";
        modal.classList.add("show");
        currentMediaIndex = 0;
        // console.log(`Opened story ${index}, current media index: ${currentMediaIndex}`);
        showMedia(currentMediaIndex);
    }

    function showMedia(index) {
        const story = stories[currentStory];
        const mediaElements = story.querySelectorAll(".story-img, video");
        if (!mediaElements[index]) return;

        // Cancela a animação anterior, se houver
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const currentMedia = mediaElements[index];
        modalMediaContainer.innerHTML = "";

        if (currentMedia.tagName === "IMG") {
            const img = document.createElement("img");
            img.src = currentMedia.src;
            img.className = "modal-content";
            modalMediaContainer.appendChild(img);
            
            // Definir duração de imagem como 5000ms
            mediaDuration = 5000;

            clearTimeout(mediaTimeout);
            mediaTimeout = setTimeout(() => {
                nextMedia();
            }, mediaDuration);

            startProgressBars(mediaDuration); // Inicia a barra de progresso com 5000ms para imagem

        } else if (currentMedia.tagName === "VIDEO") {
            const video = document.createElement("video");
            video.src = currentMedia.src;
            video.className = "modal-content";
            video.controls = false;
            video.playsInline = true;
            modalMediaContainer.appendChild(video);

            video.addEventListener("loadedmetadata", () => {
                video.play();
                video.onended = nextMedia;

                // Definir duração de vídeo com base no tempo do vídeo
                mediaDuration = video.duration * 1000; // Convertendo para milissegundos

                clearTimeout(mediaTimeout);
                mediaTimeout = setTimeout(() => {
                    nextMedia();
                }, mediaDuration);

                startProgressBars(mediaDuration); // Inicia a barra de progresso com a duração do vídeo
            });
        }

        captionText.innerHTML = story.querySelector(".text-center").textContent;

        // console.log(`Showing media ${index} in story ${currentStory}`);
    }

    function nextMedia() {
        const story = stories[currentStory];
        const mediaElements = story.querySelectorAll(".story-img, video");

        // Preencher todas as barras anteriores à mídia atual com 100%
        for (let i = 0; i < currentMediaIndex; i++) {
            const progress = progressBars[i];
            if (progress) {
                progress.style.transition = 'none'; // Remove transição
                progress.style.width = '100%'; // Define preenchimento total
            }
        }

        const currentProgress = progressBars[currentMediaIndex];
        if (currentProgress) {
            currentProgress.style.transition = 'none'; // Remove transição
            currentProgress.style.width = '100%'; // Preenche a barra atual
        }

        if (currentMediaIndex < mediaElements.length - 1) {
            currentMediaIndex++;
            // console.log(`Moving to next media, current media index: ${currentMediaIndex}`);
            showMedia(currentMediaIndex);
        } else {
            currentMediaIndex = 0;
            nextStory();
        }
    }

    function prevMedia() {
        const story = stories[currentStory];
        const mediaElements = story.querySelectorAll(".story-img, video");

        const currentProgress = progressBars[currentMediaIndex];
        if (currentProgress) {
            currentProgress.style.transition = 'none'; 
            currentProgress.style.width = '0%'; 
        }

        if (currentMediaIndex > 0) {
            currentMediaIndex--;
            // console.log(`Moving to previous media, current media index: ${currentMediaIndex}`);
            showMedia(currentMediaIndex);
        } else {
            currentMediaIndex = 0;
            currentStory--;
            if (currentStory < 0) {
                closeModal();
            } else {
                showStory(currentStory);
            }
        }
    }

    function nextStory() {
        currentStory++;
        if (currentStory >= stories.length) {
            closeModal();
        } else {
            showStory(currentStory);
        }
    }

    function closeModal() {
        modal.style.display = "none";
        modal.classList.remove("show");

        clearTimeout(mediaTimeout);

        const video = modalMediaContainer.querySelector("video");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }

    function addProgressBars(count) {
        for (let i = 0; i < count; i++) {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressBars.push(progressFill);
            
            progressItem.appendChild(progressFill);
            progressBarContainer.appendChild(progressItem);
        }
    }

    function animateProgressBar(progressElement, duration) {
        let startTime = null;

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1); 

            progressElement.style.width = (progress * 100) + '%';

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animationStep); // Salva o ID da animação atual
            }
        }

        animationFrameId = requestAnimationFrame(animationStep);
    }

    function startProgressBars(duration) {
        const currentProgress = progressBars[currentMediaIndex];

        if (currentProgress) {
            animateProgressBar(currentProgress, duration); // Duração variável com base no tipo de mídia
        }
    }

    document.querySelectorAll(".story").forEach((story, index) => {
        story.addEventListener("click", function () {
            currentStory = index;
            showStory(currentStory);
        });
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.querySelector(".close-btn").addEventListener("click", function (event) {
        event.stopPropagation();
        closeModal();
    });

    document.getElementById("prev-btn").addEventListener("click", function () {
        prevMedia();
    });

    document.getElementById("next-btn").addEventListener("click", function () {
        nextMedia();
    });
});