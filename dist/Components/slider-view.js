class ImageSlider extends HTMLElement {
    // _menu: HTMLElement | null;
    constructor() {
        super();
        this.deleteImageFromContainer = (event) => {
            console.log(event.target);
            if (this.imagesArray.length === 0)
                return;
            this.imagesArray.splice(this.imageArrayIndex, 1);
            this.imageArrayIndex = Math.min(this.imageArrayIndex, this.imagesArray.length - 1);
            this.renderView();
        };
        this.closeOptionsOnClickOutside = (event) => {
            const optionsMenu = this._shadow.querySelector('.options__container');
            const targetElement = event.composedPath()[0];
            if (targetElement.parentElement !== optionsMenu) {
                optionsMenu?.classList.remove('open');
            }
        };
        this.openOptions = (event) => {
            event.stopPropagation();
            const optionsContainer = this._shadow.querySelector(".options__container");
            if (optionsContainer) {
                optionsContainer.classList.toggle("open");
            }
        };
        /** Agrega una imagen al contenedor principal */
        this.addImageToContainer = (event) => {
            const fileSelector = this._shadow.querySelector('input[type="file"][hidden][id="hiddenSubmit"]');
            if (!fileSelector || !fileSelector.files || fileSelector.files.length === 0) {
                console.warn("No file selected or file input not found.");
                return;
            }
            const file = fileSelector.files[0];
            const blobUrl = URL.createObjectURL(file);
            if (this._currentUploadImageOption === "update") {
                this.imagesArray[this.imageArrayIndex] = blobUrl;
            }
            else {
                this.imagesArray.push(blobUrl);
                this.imageArrayIndex = this.imagesArray.length - 1;
            }
            this.renderView();
        };
        /** Activa el selector de archivos */
        this.triggerFileSelector = (event) => {
            let action = event.target.getAttribute('data-action');
            this._currentUploadImageOption = action ? action : "add";
            const fileSelector = this._shadow.querySelector('input[type="file"][hidden][id="hiddenSubmit"]');
            if (!fileSelector) {
                console.warn("File input not found in shadow DOM.");
                return;
            }
            fileSelector.click();
        };
        /** Agregar una imagen al contenedor principal */
        this.nextImage = (event) => {
            event.preventDefault();
            this.imageArrayIndex++;
            this.imageArrayIndex > this.imagesArray.length - 1
                ? (this.imageArrayIndex = 0)
                : null;
            // console.log(`Selected image: ${this.imageIndex}`);
            this.renderView();
        };
        this.prevImage = (event) => {
            event.preventDefault();
            this.imageArrayIndex--;
            this.imageArrayIndex < 0
                ? (this.imageArrayIndex = this.imagesArray.length - 1)
                : null;
            // console.log(`Selected image: ${this.imageIndex}`);
            this.renderView();
        };
        this._bgColor = "ffffff";
        this.imagesArray = [];
        this._currentUploadImageOption = "";
        this.imageArrayIndex = 0;
        this._sliderType = "";
        this._errorOnSlider = "";
        this._currImgOnSlider = "";
        this._shadow = this.attachShadow({ mode: "open" });
        this._contentOnSliderExist = false;
    }
    connectedCallback() {
        this._sliderType = this.getAttribute("type") || "view";
        if (this._sliderType !== "view" && this._sliderType !== "submit") {
            this.renderError('El atributo "type" debe ser "view" o "submit".');
            return;
        }
        this._bgColor = this.getAttribute("bgColor") || "ffffff";
        /** Activa el evento para agregar una imagen al slider */
        this.renderView();
        let urls;
        urls = this.getAttribute("images") ?? "{}";
    }
    static get observedAttributes() {
        /**
         * images: recibe array de urls para renderizar en el slider
         * type: indica si es un componente de solo visualizacion o de subida de imagenes
         */
        return ["images", "bgColor"];
    }
    loadImagesToComponent(parsedUrls) {
        if (Array.isArray(parsedUrls.urls)) {
            this.imagesArray = parsedUrls.urls;
            this.renderView();
        }
        else {
            this.renderError('El atributo debe tener una propiedad "urls" con un arreglo.');
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "images") {
            try {
                const parsed = JSON.parse(newValue);
                if (Array.isArray(parsed.urls)) {
                    this.imagesArray = parsed.urls;
                    this.imageArrayIndex = 0;
                    console.log('Se ha actualizado el atributo "images"');
                    this.renderView();
                }
                else {
                    this.renderError('Formato incorrecto en "urls"');
                }
            }
            catch (err) {
                this.renderError("JSON inválido");
            }
        }
    }
    async renderView() {
        this._shadow.innerHTML = `
      <style>
        
        *{
          user-select: none;
          box-sizing: border-box;
        }
        
        html, body {
          -webkit-text-size-adjust: none;
        }

        :host {
          display: block;
          width: 100%;
        }

        .border--dotted {
          border: 3px dashed white;
        }

        .border--line {
          border: 3px solid #ffffff04;
        }

        .wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #${this._bgColor ?? "ffffff"};
          padding: ${this._sliderType === "submit" ? "50" : "0"}px 0px 30px 0px;
          position: relative;
          height: fit-content;
          border-radius: 8px;
          padding: 25px 5px 20px 5px;
        }

        .wrapper__imageContainer > img {
          width: 100%;
          // height: 100%;
          object-fit: cover;
          display: block;
          // margin: 0 30px 0px 30px;
        }

        .dotContainer {
            position: absolute;
            bottom: 2%;
            height: 10px;
            width: fit-content;
            // background-color: red;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 5px;
        }

        .dotContainer__dot {
            background-color: yellow;
            background-color: #dbdbdbff;
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }

        .dotContainer__dot--active {
          background-color: red;
        }

        .leftArrow {
          position: absolute;
          height: 25px;
          width: auto;
          // background-color: black;
          left: calc(4% - 10px);
        }

        .rightArrow {
          position: absolute;
          height: 25px;
          width: auto;
          // background-color: black;
          right: calc(4% - 10px);
        }

        .img--active {
          display: block !important;
        }

        .img--inactive {
          display: none !important;
        }

        .leftArrow:hover, .rightArrow:hover {
          cursor: pointer;
        }

        .wrapper__imageContainer {
          aspect-ratio: 16 / 9;
          width: 85%;
          // object-fit: cover;
          // display: block;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          overflow: hidden;
          background-color: #d6d6d6;
        }

        ${this.imagesArray.length === 0
            ? `
            .wrapper__imageContainer:hover {
              opacity: 0.7;
              cursor: pointer
            }  
          `
            : ``}

        .addImageIcon {
          height: 60px !important;
          width: auto !important;
          background: white;
          border-radius: 50%;
        }

        .options__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 1px;
          right: 1px;
          height: 30px;
          width: 30px;
          // background-color: red;
        }

        .options__button {
          display: flex;
          position: absolute;
          height: 18px;
          width: 18px;
          // top: 7px;
          // right: 7px;
          background: #f2f2f2ff;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
        }

        .options__container.open {
          max-height: 500px; /* más alto que el contenido esperado */
          // height: 200px;
          opacity: 1;
          // background-color: red;
        }

        .options__container {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.3s ease;
          position: absolute;
          background-color: white;
          height: fit-content;
          width: max-content;
          display: flex;
          flex-direction: column;
          align-items: center;
          top: calc(10% + 25px);
          right: calc(10% + 25px);
          overflow: hidden;
          border-radius: 8px;
          z-index: 100;
        }

        .options__container--option {
          padding: 10px;
          cursor: pointer;
          width: 100%;
          text-align: center;
          font-size: 12px;
          display: flex;
          align-items: center;
          // justify-content: flex-start;
          gap: 10px;
        }

        .options__container--option:hover {
          background-color: #818181;
        }

        .option__icon {
          height: 12px;
          width: auto;
        }

        @media screen and (min-width: 768px){
          .dotContainer__dot {
            width: 9px;
            height: 9px;
          }
          .options__wrapper {
            top: 10px;
            right: 10px;
          }
          .dotContainer {
            bottom: 3%;
          }
          .options__button {
            height: 25px;
            width: 25px;
            // top: 15px;
            // right: 15px;
          }
          .rightArrow{
            height: 35px;
          }
          .leftArrow{
            height: 35px;
          }

          .options__container--option{
            font-size: 16px;
          }
          .option__icon{
            height: 18px;
          }
        }

        @media screen and (min-width: 1024px){
          .options__container--option{
            font-size: 16px;
          }
          .option__icon{
            font-size: 18px;
          }
        }

      </style>
      <div class="wrapper">
        ${this.imagesArray.length !== 0 && this._sliderType === "submit"
            ? `
              <span class="options__wrapper">
                <img class="options__button" src="./icons/optionDots.svg"/>
                <div class="options__container">
                  <div class="options__container--option" data-action='add'><img class="option__icon" src="./icons/add.svg"/>Agregar</div>
                  <div class="options__container--option" data-action='delete'><img class="option__icon" src="./icons/delete.svg"/>Eliminar</div>
                  <div class="options__container--option" data-action='update'><img class="option__icon" src="./icons/update.svg"/>Actualizar</div>
                </div>
              </span>
              `
            : ""}

        <div class="wrapper__imageContainer ${this.imagesArray.length === 0 ? "border--dotted" : "border--line"}">
          ${this.imagesArray.length > 1 ? `
            <svg class='leftArrow' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z" fill="#0F0F0F"/>
            </svg>
            <svg class='rightArrow' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#0F0F0F"/>
            </svg> 
            ` : ""} 
          ${
        /** When type is submit and there is no images, add an icon that sugest add an image */
        this.imagesArray.length === 0
            ? this._sliderType === "submit"
                ? `<img class="addImageIcon" src="./icons/add.svg"/>`
                : "No hay contenido para mostrar"
            : ""}
          <input type="file" hidden id="hiddenSubmit"/>
            ${
        /** In the case imagesArray is not zero, render images in any type case*/
        this.imagesArray.length !== 0
            ? this.imagesArray
                .map((_, index) => {
                return `<img src="${this.imagesArray[index]}" class="${index === this.imageArrayIndex
                    ? "img--active"
                    : "img--inactive"}" alt="Image slider"/>`;
            })
                .join("")
            : ""}
          </div>
          ${
        /** In the case imagesArray is more than 1 image, render arrows and dots */
        this.imagesArray.length > 1
            ? `
            <div class='dotContainer'>
              ${this.imagesArray
                .map((_, index) => {
                return `<div class='dotContainer__dot ${this.imageArrayIndex === index ? "dotContainer__dot--active" : ""}'></div>`;
            })
                .join("")}
            </div>
          `
            : ""}
      </div>
      `;
        this.loadListeners();
    }
    loadListeners() {
        /** Listener para previa imagen */
        const leftArrow = this._shadow.querySelector(".leftArrow");
        if (leftArrow) {
            leftArrow.removeEventListener("click", this.prevImage);
            leftArrow.addEventListener("click", this.prevImage);
        }
        /** Listener para siguiente imagen */
        const rightArrow = this._shadow.querySelector(".rightArrow");
        if (rightArrow) {
            rightArrow.removeEventListener("click", this.nextImage);
            rightArrow.addEventListener("click", this.nextImage);
        }
        /** Listener para abrir selector de archivos */
        if (this._sliderType === "submit" && this.imagesArray.length === 0) {
            const toSubmitImageButton = this._shadow.querySelector(".wrapper__imageContainer");
            if (toSubmitImageButton) {
                toSubmitImageButton.removeEventListener("click", this.triggerFileSelector);
                toSubmitImageButton.addEventListener("click", this.triggerFileSelector);
            }
        }
        /** Interaccion para agregar una imagen desde options */
        const addImageOption = this._shadow.querySelector(".options__container--option[data-action='add']");
        if (addImageOption) {
            addImageOption.removeEventListener("click", this.triggerFileSelector);
            addImageOption.addEventListener("click", this.triggerFileSelector);
        }
        /** Interaccion para actualizar una imagen desde options */
        const updateImageOption = this._shadow.querySelector(".options__container--option[data-action='update']");
        if (updateImageOption) {
            updateImageOption.removeEventListener("click", this.triggerFileSelector);
            updateImageOption.addEventListener("click", this.triggerFileSelector);
        }
        /** Interaccion para eliminar una imagen desde options */
        const deleteImageOption = this._shadow.querySelector(".options__container--option[data-action='delete']");
        if (deleteImageOption) {
            deleteImageOption.removeEventListener("click", this.deleteImageFromContainer);
            deleteImageOption.addEventListener("click", this.deleteImageFromContainer);
        }
        /** Listener para agregar imagen al contenedor */
        const fileSelector = this._shadow.querySelector('input[type="file"][hidden][id="hiddenSubmit"]');
        if (fileSelector) {
            fileSelector.removeEventListener("change", this.addImageToContainer);
            fileSelector.addEventListener("change", this.addImageToContainer);
        }
        /** Listener para abrir las options */
        const optionsButton = this._shadow.querySelector(".options__button");
        const optionsContainer = this._shadow.querySelector(".options__container");
        if (optionsButton && optionsContainer) {
            optionsButton.removeEventListener("click", this.openOptions);
            optionsButton.addEventListener("click", this.openOptions);
        }
        /** Listener para cerrar el menu de opciones cuando se ha presionado en otro lado */
        document.removeEventListener('click', this.closeOptionsOnClickOutside);
        document.addEventListener('click', this.closeOptionsOnClickOutside);
    }
    renderEmpty() {
        this._shadow.innerHTML = `<div>No se proporcionó el atributo "images".</div>`;
    }
    renderError(message) {
        this._shadow.innerHTML = `<div style="color:red;">${message}</div>`;
    }
}
export default ImageSlider;
