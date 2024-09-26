document.addEventListener("DOMContentLoaded", function () {
  const slider = CustomSlider.init("#places-slider");

  setInterval(() => {
    slider.next();
  }, 1000);
});

class CustomSlider {
  constructor(target) {
    this.index = 1;
    this.isMoved = true;
    this.speed = 1000; // ms
    this.transform = `transform ${this.speed / 1000}s`;
    this.slider = document.querySelector(target);

    this.initSlider();
    this.addEventListeners();
  }

  getTranslateValue(i) {
    return `translateX(-${100 * i}%)`;
  }

  initSlider() {
    const sliderRects = this.slider.getClientRects()[0];
    this.slider.style.overflow = "hidden";
    this.container = document.createElement("div");
    this.container.style.display = "flex";
    this.container.style.flexDirection = "row";
    this.container.style.width = `${sliderRects.width}px`;
    this.container.style.height = `${sliderRects.height}px`;
    this.container.style.transform = this.getTranslateValue(this.index);
    this.boxes = Array.from(this.slider.children);
    this.boxes = [
      this.boxes[this.boxes.length - 1],
      ...this.boxes,
      this.boxes[0],
    ];
    this.size = this.boxes.length;
    this.boxes.forEach((box) => {
      const clonedBox = box.cloneNode(true);
      clonedBox.style.flex = "none";
      clonedBox.style.flexWrap = "wrap";
      clonedBox.style.height = "100%";
      clonedBox.style.width = "100%";
      this.container.appendChild(clonedBox);
    });
    this.slider.innerHTML = "";
    this.slider.appendChild(this.container);
  }

  addEventListeners() {
    this.container.addEventListener("transitionstart", () => {
      this.isMoved = false;
      setTimeout(() => {
        this.isMoved = true;
      }, this.speed);
    });

    this.container.addEventListener("transitionend", () => {
      if (this.index === this.size - 1) {
        this.index = 1;
        this.container.style.transition = "none";
        this.container.style.transform = this.getTranslateValue(this.index);
      }

      if (this.index === 0) {
        this.index = this.size - 2;
        this.container.style.transition = "none";
        this.container.style.transform = this.getTranslateValue(this.index);
      }
    });
  }

  move(i) {
    if (this.isMoved) {
      this.index = i;
      this.container.style.transition = this.transform;
      this.container.style.transform = this.getTranslateValue(this.index);
    }
  }

  next() {
    if (this.isMoved) {
      this.index = (this.index + 1) % this.size;
      this.container.style.transition = this.transform;
      this.container.style.transform = this.getTranslateValue(this.index);
    }
  }

  prev() {
    if (this.isMoved) {
      this.index = this.index === 0 ? this.size - 1 : this.index;
      this.index = (this.index - 1) % this.size;
      this.container.style.transition = this.transform;
      this.container.style.transform = this.getTranslateValue(this.index);
    }
  }

  static init(target) {
    return new CustomSlider(target);
  }
}
