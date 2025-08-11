import ImageSlider from "./slider-view.js";

class ImageSliderSubmit extends ImageSlider {
    constructor() {
        super();
    }

    connectedCallback(): void {
        this.render();
    }
}

export default ImageSliderSubmit;