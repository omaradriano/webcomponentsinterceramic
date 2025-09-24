class ImageSlider extends HTMLElement {
  imagesArray: string[];
  imageArrayIndex: number;
  _shadow: ShadowRoot;
  _sliderType: string; //Type of the slider view | submit
  _errorOnSlider: string; //Saves the error in slider
  _contentOnSliderExist: boolean; // Aux variable to verify if there is content in imagesArray
  _currImgOnSlider: string;

  constructor() {
    super();
    this.imagesArray = [];
    this.imageArrayIndex = 0;
    this._sliderType = "";
    this._errorOnSlider = "";
    this._currImgOnSlider = "";
    this._shadow = this.attachShadow({ mode: "closed" });
    this._contentOnSliderExist = false;
  }

  connectedCallback() {
    this._sliderType = this.getAttribute("type") || "view";
    if (this._sliderType !== "view" && this._sliderType !== "submit") {
      this.renderError('El atributo "type" debe ser "view" o "submit".');
      return;
    }
    /** Activa el evento para agregar una imagen al slider */
    this.renderView();

    let urls: string | undefined;
    urls = this.getAttribute("images") ?? "{}";
  }

  static get observedAttributes() {
    /**
     * images: recibe array de urls para renderizar en el slider
     * type: indica si es un componente de solo visualizacion o de subida de imagenes
     */
    return ["images"];
  }

  loadImagesToComponent(parsedUrls: { urls: [] }) {
    if (Array.isArray(parsedUrls.urls)) {
      this.imagesArray = parsedUrls.urls;
      this.renderView();
    } else {
      this.renderError(
        'El atributo debe tener una propiedad "urls" con un arreglo.'
      );
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "images") {
      try {
        const parsed = JSON.parse(newValue);
        if (Array.isArray(parsed.urls)) {
          this.imagesArray = parsed.urls;
          this.imageArrayIndex = 0;
          console.log('Se ha actualizado el atributo "images"');
          this.renderView();
        } else {
          this.renderError('Formato incorrecto en "urls"');
        }
      } catch (err) {
        this.renderError("JSON inválido");
      }
    }
    // if (name === "type") {
    //   this._sliderType = newValue;
    //   console.log(`Tipo de componente actualizado a: ${this._sliderType}`);
    //   this.renderView();
    // }
  }

  async renderView() {
    this._shadow.innerHTML = `
      <style>
        
        *{
          user-select: none;
        }

        :host {
            display: block;
            width: 100%;
        }

        .border--dotted {
          border: 3px dashed white;
        }

        .border--line {
          border: 3px solid #dcdcdcff;
        }

        .wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #bcbcbc85;
          padding: ${this._sliderType === "submit" ? "50" : "0"}px 0px 30px 0px;
          position: relative;
          height: fit-content;
          border-radius: 8px;
        }

        // .wrapper__imageContainer:hover > img {
        //   background-color: black;
        // }

        .wrapper__imageContainer > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            // margin: 0 30px 0px 30px;
        }

        .dotContainer {
            position: absolute;
            bottom: 5px;
            height: 20px;
            width: fit-content;
            // background-color: red;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 5px;
        }

        .dotContainer__dot {
            background-color: yellow;
            background-color: #fff;
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .dotContainer__dot--active {
            background-color: red;
        }

        .leftArrow {
            position: absolute;
            height: 50px;
            width: 40px;
            // background-color: black;
            left: calc(3% - 15px);
        }

        .rightArrow {
            position: absolute;
            height: 50px;
            width: 40px;
            // background-color: black;
            right: calc(3% - 15px);
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
          height: 100%;
          width: 85%;
          object-fit: cover;
          display: block;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          overflow: hidden;
          // background-color: trasnparent;
        }

        ${
          this.imagesArray.length === 0
            ? `
            .wrapper__imageContainer:hover {
              opacity: 0.7;
              cursor: pointer
            }  
          `
            : ``
        }

        .addImageIcon {
          height: 60px !important;
          width: auto !important;
          background: white;
          border-radius: 50%;
        }

        .options {
          position: absolute;
          height: 16px;
          width: auto;
          top: 11px;
          right: 11px;
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
          width: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          top: 3%;
          right: 10%;
          overflow: hidden;
          border-radius: 8px;
        }

        .options__container--option {
          padding: 10px;
          cursor: pointer;
          width: 100%;
          text-align: center;
        }

        .options__container--option:hover {
          background-color: #818181;
        }

      </style>
      <div class="wrapper">
        ${
          this.imagesArray.length !== 0 && this._sliderType === "submit"
            ? `<img class="options" src="./icons/optionDots.svg"/>`
            : ""
        }

        <div class="options__container">
          <div class="options__container--option" data-action='add'>Agregar</div>
          <div class="options__container--option" data-action='delete'>Eliminar</div>
          <div class="options__container--option" data-action='update'>Actualizar</div>
        </div>

        <div class="wrapper__imageContainer ${
          this.imagesArray.length === 0 ? "border--dotted" : "border--line"
        }">
          ${
            /** When type is submit and there is no images, add an icon that sugest add an image */
            this.imagesArray.length === 0
              ? this._sliderType === "submit"
                ? `<img class="addImageIcon" src="./icons/add.svg"/>`
                : "No hay contenido para mostrar"
              : ""
          }
          <input type="file" hidden id="hiddenSubmit"/>
            ${
              /** In the case imagesArray is not zero, render images in any type case*/
              this.imagesArray.length !== 0
                ? this.imagesArray
                    .map((_, index) => {
                      return `<img src="${this.imagesArray[index]}" class="${
                        index === this.imageArrayIndex
                          ? "img--active"
                          : "img--inactive"
                      }" alt="Image slider"/>`;
                    })
                    .join("")
                : ""
            }
          </div>
          ${
            /** In the case imagesArray is more than 1 image, render arrows and dots */
            this.imagesArray.length > 1
              ? `
            <div class='dotContainer'>
              ${this.imagesArray
                .map((_, index) => {
                  return `<div class='dotContainer__dot ${
                    this.imageArrayIndex === index ? "dotContainer__dot--active" : ""
                  }'></div>`;
                })
                .join("")}
            </div>
            <svg class='leftArrow' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z" fill="#0F0F0F"/>
            </svg>
            <svg class='rightArrow' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#0F0F0F"/>
            </svg>  
          `
              : ""
          }
      </div>
      `;

    this.loadListeners();
  }

  // async loadStyles() {
  //   const response = await fetch('/dist/styles/image-slider.css');
  //   console.log(response.text());
  //   const css = await response.text();
  //   const styleEl = document.createElement('style');
  //   styleEl.textContent = css;
  //   this._shadow.appendChild(styleEl);
  // }

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
      const toSubmitImageButton = this._shadow.querySelector(
        ".wrapper__imageContainer"
      ) as HTMLDivElement;
      if (toSubmitImageButton) {
        toSubmitImageButton.removeEventListener("click", this.triggerFileSelector);
        toSubmitImageButton.addEventListener("click", this.triggerFileSelector);
      }
    }
    /** Interaccion para agregar una imagen desde options */
    const addImageOption = this._shadow.querySelector(
      ".options__container--option[data-action='add']"
    );
    if (addImageOption) {
      addImageOption.removeEventListener("click", this.triggerFileSelector);
      addImageOption.addEventListener("click", this.triggerFileSelector);
    }

    /** Listener para agregar imagen al contenedor */
    const fileSelector = this._shadow.querySelector(
      'input[type="file"][hidden][id="hiddenSubmit"]'
    ) as HTMLInputElement | null;
    if (fileSelector) {
      fileSelector.removeEventListener("change", this.addImageToContainer);
      fileSelector.addEventListener("change", this.addImageToContainer);
    }

    /** Listener para abrir las options */
    const optionsButton = this._shadow.querySelector(".options");
    const optionsContainer = this._shadow.querySelector(".options__container");
    if (optionsButton && optionsContainer) {
      optionsButton.removeEventListener("click", this.openOptions);
      optionsButton.addEventListener("click", this.openOptions);
    }

    /** TASK: Implementar funcionalidad para desactivar dropdown cuando se ha dado click en otro lado */
  }

  openOptions = (event: Event) => {
    event.stopPropagation();
    const optionsContainer = this._shadow.querySelector(".options__container");
    if (optionsContainer) {
      optionsContainer.classList.toggle("open");
    }
  }

  /** Agrega una imagen al contenedor principal */
  addImageToContainer = (event: Event) => {
    const fileSelector = this._shadow.querySelector(
      'input[type="file"][hidden][id="hiddenSubmit"]'
    ) as HTMLInputElement | null;
    if (!fileSelector || !fileSelector.files || fileSelector.files.length === 0) {
      console.warn("No file selected or file input not found.");
      return;
    }
    const file = fileSelector.files[0];
    const blobUrl = URL.createObjectURL(file);
    this.imagesArray.push(blobUrl);
    this.imageArrayIndex = this.imagesArray.length - 1;
    this.renderView();
  };

  /** Activa el selector de archivos */
  triggerFileSelector = (event: Event) => {
    const fileSelector = this._shadow.querySelector(
      'input[type="file"][hidden][id="hiddenSubmit"]'
    ) as HTMLInputElement | null;
    if (!fileSelector) {
      console.warn("File input not found in shadow DOM.");
      return;
    }
    fileSelector.click();
  };

  /** Agregar una imagen al contenedor principal */

  nextImage = (event: Event) => {
    event.preventDefault();
    this.imageArrayIndex++;
    this.imageArrayIndex > this.imagesArray.length - 1
      ? (this.imageArrayIndex = 0)
      : null;
    // console.log(`Selected image: ${this.imageIndex}`);
    this.renderView();
  };

  prevImage = (event: Event) => {
    event.preventDefault();
    this.imageArrayIndex--;
    this.imageArrayIndex < 0
      ? (this.imageArrayIndex = this.imagesArray.length - 1)
      : null;
    // console.log(`Selected image: ${this.imageIndex}`);
    this.renderView();
  };

  updateDotContainer() {}

  renderEmpty() {
    this._shadow.innerHTML = `<div>No se proporcionó el atributo "images".</div>`;
  }

  renderError(message: string) {
    this._shadow.innerHTML = `<div style="color:red;">${message}</div>`;
  }
}

export default ImageSlider;
