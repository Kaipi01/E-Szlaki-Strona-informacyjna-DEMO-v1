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
class Card3DEffect {
  constructor(htmlElement) {
    this.card = htmlElement;
    this.bounds = null;

    // Bind methods to ensure 'this' refers to the class instance
    this.rotateToMouse = this.rotateToMouse.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    this.init();
  }

  // Inicjalizacja event listenerów
  init() {
    this.card.addEventListener("mouseenter", this.onMouseEnter);
    this.card.addEventListener("mouseleave", this.onMouseLeave);
  }

  // Funkcja odpowiadająca za rotację względem pozycji myszy
  rotateToMouse(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const leftX = mouseX - this.bounds.x;
    const topY = mouseY - this.bounds.y;
    const center = {
      x: leftX - this.bounds.width / 2,
      y: topY - this.bounds.height / 2,
    };
    const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

    // Ustawienie transformacji i efektu świetlnego
    this.card.style.transform = `
      scale3d(1.07, 1.07, 1.07)
      rotate3d(
        ${center.y / 100},
        ${-center.x / 100},
        0,
        ${Math.log(distance) * 2}deg
      )
    `;

    this.card.querySelector(".glow").style.backgroundImage = `
      radial-gradient(
        circle at
        ${center.x * 2 + this.bounds.width / 2}px
        ${center.y * 2 + this.bounds.height / 2}px,
        #ffffff55,
        #0000000f
      )
    `;
  }

  // Funkcja uruchamiana przy wejściu kursora na kartę
  onMouseEnter() {
    this.bounds = this.card.getBoundingClientRect();
    document.addEventListener("mousemove", this.rotateToMouse);
  }

  // Funkcja uruchamiana przy opuszczeniu kursora z karty
  onMouseLeave() {
    document.removeEventListener("mousemove", this.rotateToMouse);
    this.card.style.transform = ""; // Resetowanie transformacji
    this.card.querySelector(".glow").style.backgroundImage = ""; // Resetowanie tła
  }
}