document.addEventListener("DOMContentLoaded", function () {

  //Scroll spy skrypt
  //linki są dynamicznie generowane na podstawie nagłówków posiadających klase "js-toc-title"
  new TableOfContents("#our-mission-information .js-toc").init();
  // Tabs skrypt
  // linki są dynamicznie generowane na podstawie nagłówków posiadających klase "tab-content-title"
  //new TabsContent("#modules-and-tools .tabs").init();

  ScrollToTopButton.init("#back-to-top-button");
  // CustomSelect.initAll();
  // CustomRangeSlider.initAll();

  // const slider = CustomSlider.init("#places-slider");

  // setInterval(() => {
  //   slider.next();
  // }, 1000);

  
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

class TableOfContents {
  constructor(selector) {
    this.container = document.querySelector(selector);
    this.links = [];
    this.list = null;
    this.intersectionOptions = {
      rootMargin: "0px",
      threshold: 1,
    };
    this.previousSection = null;
    this.observer = null;
    this.headings = this.container.querySelectorAll(".js-toc-title");
  }

  init() {
    this.handleObserver = this.handleObserver.bind(this);

    this.setUpObserver();
    this.createLinksFromHeadings();
    this.observeSections();
  }

  handleObserver(entries, observer) {
    entries.forEach((entry) => {
      let href = `#${entry.target.getAttribute("id")}`,
        link = this.links.find((l) => l.getAttribute("href") === href);

      if (entry.isIntersecting && entry.intersectionRatio >= 1) {
        link.classList.add("is-visible");
        this.previousSection = entry.target.getAttribute("id");
      } else {
        link.classList.remove("is-visible");
      }

      this.highlightFirstActive();
    });
  }

  highlightFirstActive() {
    let firstVisibleLink = this.container.querySelector(".is-visible");

    this.links.forEach((link) => {
      link.classList.remove("active");
      link.parentElement.classList.remove("list-li-hover");
    });

    if (firstVisibleLink) {
      firstVisibleLink.classList.add("active");
      firstVisibleLink.parentElement.classList.add("list-li-hover");
    }

    if (!firstVisibleLink && this.previousSection) {
      const currentLink = this.container.querySelector(
        `a[href="#${this.previousSection}"]`
      );

      currentLink.classList.add("active");
      currentLink.parentElement.classList.add("list-li-hover");
    }
  }

  observeSections() {
    this.headings.forEach((heading) => {
      this.observer.observe(heading);
    });
  }

  setUpObserver() {
    this.observer = new IntersectionObserver(
      this.handleObserver,
      this.intersectionOptions
    );
  }

  createLinksFromHeadings() {
    this.list = this.container.querySelector(".js-toc-list");

    this.headings.forEach((heading) => {
      const li = document.createElement("li");
      const link = document.createElement("a");

      link.textContent = heading.textContent;

      if (heading.id) {
        link.href = `#${heading.id}`;
      } else {
        let slugByTextContent = slugify(heading.textContent);
        link.href = `#${slugByTextContent}`;
        heading.id = slugByTextContent;
      }

      li.appendChild(link);
      this.list.appendChild(li);
      this.links.push(link);
    });
  }
}

class CustomSelect {
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.numberOfOptions = selectElement.children.length;
    this.createCustomElements();
    this.attachEventListeners();
  }

  createCustomElements() {
    this.selectElement.classList.add("custom-select-hidden");
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("custom-select");
    this.selectElement.parentNode.insertBefore(
      this.wrapper,
      this.selectElement
    );
    this.wrapper.appendChild(this.selectElement);
    this.styledSelect = document.createElement("div");
    this.styledSelect.classList.add("custom-select-styled");
    this.styledSelect.textContent = this.selectElement.options[0].textContent;
    this.wrapper.appendChild(this.styledSelect);
    this.optionList = document.createElement("ul");
    this.optionList.classList.add("custom-select-options");
    this.wrapper.appendChild(this.optionList);

    for (let i = 0; i < this.numberOfOptions; i++) {
      let listItem = document.createElement("li");
      listItem.textContent = this.selectElement.options[i].textContent;
      listItem.setAttribute("rel", this.selectElement.options[i].value);
      this.optionList.appendChild(listItem);

      if (this.selectElement.options[i].selected) {
        listItem.classList.add("is-selected");
      }
    }

    this.listItems = this.optionList.querySelectorAll("li");
  }

  attachEventListeners() {
    this.styledSelect.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll("div.custom-select-styled.active")
        .forEach((activeStyledSelect) => {
          if (activeStyledSelect !== this.styledSelect) {
            activeStyledSelect.classList.remove("active");
            activeStyledSelect.nextElementSibling.style.display = "none";
          }
        });
      this.styledSelect.classList.toggle("active");
      this.optionList.style.display = this.styledSelect.classList.contains(
        "active"
      )
        ? "block"
        : "none";
    });

    this.listItems.forEach((listItem) => {
      listItem.addEventListener("click", (e) => {
        e.stopPropagation();
        this.styledSelect.textContent = listItem.textContent;
        this.styledSelect.classList.remove("active");
        this.selectElement.value = listItem.getAttribute("rel");
        this.optionList
          .querySelector("li.is-selected")
          .classList.remove("is-selected");
        listItem.classList.add("is-selected");
        this.optionList.style.display = "none";
      });
    });

    document.addEventListener("click", () => {
      this.styledSelect.classList.remove("active");
      this.optionList.style.display = "none";
    });
  }

  static initAll() {
    document
      .querySelectorAll("select[data-custom-select]")
      .forEach((selectElement) => {
        new CustomSelect(selectElement);
      });
  }
}

class CustomRangeSlider {
  constructor(fromSlider, toSlider, fromTooltip, toTooltip, scaleElement) {
    this.COLOR_TRACK = "#CBD5E1";
    this.COLOR_RANGE = "#0EA5E9";

    this.fromSlider = fromSlider;
    this.toSlider = toSlider;
    this.fromTooltip = fromTooltip;
    this.toTooltip = toTooltip;
    this.scaleElement = scaleElement;

    this.MIN = parseInt(this.fromSlider.getAttribute("min"));
    this.MAX = parseInt(this.fromSlider.getAttribute("max"));
    this.STEPS = parseInt(this.scaleElement.dataset.steps);

    this.init();
  }

  init() {
    this.fromSlider.addEventListener("input", () => this.controlFromSlider());
    this.toSlider.addEventListener("input", () => this.controlToSlider());

    this.fillSlider();
    this.setToggleAccessible();
    this.setTooltip(this.fromSlider, this.fromTooltip);
    this.setTooltip(this.toSlider, this.toTooltip);
    this.createScale(this.MIN, this.MAX, this.STEPS);
  }

  controlFromSlider() {
    const [from, to] = this.getParsedValues();
    this.fillSlider();
    if (from > to) {
      this.fromSlider.value = to;
    }
    this.setTooltip(this.fromSlider, this.fromTooltip);
  }

  controlToSlider() {
    const [from, to] = this.getParsedValues();
    this.fillSlider();
    this.setToggleAccessible();
    if (from <= to) {
      this.toSlider.value = to;
    } else {
      this.toSlider.value = from;
    }
    this.setTooltip(this.toSlider, this.toTooltip);
  }

  getParsedValues() {
    const from = parseInt(this.fromSlider.value, 10);
    const to = parseInt(this.toSlider.value, 10);
    return [from, to];
  }

  fillSlider() {
    const rangeDistance = this.toSlider.max - this.toSlider.min;
    const fromPosition = this.fromSlider.value - this.toSlider.min;
    const toPosition = this.toSlider.value - this.toSlider.min;

    this.toSlider.style.background = `linear-gradient(
      to right,
      ${this.COLOR_TRACK} 0%,
      ${this.COLOR_TRACK} ${(fromPosition / rangeDistance) * 100}%,
      ${this.COLOR_RANGE} ${(fromPosition / rangeDistance) * 100}%,
      ${this.COLOR_RANGE} ${(toPosition / rangeDistance) * 100}%,
      ${this.COLOR_TRACK} ${(toPosition / rangeDistance) * 100}%,
      ${this.COLOR_TRACK} 100%)`;
  }

  setToggleAccessible() {
    if (Number(this.toSlider.value) <= 0) {
      this.toSlider.style.zIndex = 2;
    } else {
      this.toSlider.style.zIndex = 0;
    }
  }

  setTooltip(slider, tooltip) {
    const value = slider.value;
    tooltip.textContent = `$${value}`;
    const thumbPosition = (value - slider.min) / (slider.max - slider.min);
    const percent = thumbPosition * 100;
    const markerWidth = 20;
    const offset = (((percent - 50) / 50) * markerWidth) / 2;
    tooltip.style.left = `calc(${percent}% - ${offset}px)`;
  }

  createScale(min, max, step) {
    const range = max - min;
    const steps = range / step;
    for (let i = 0; i <= steps; i++) {
      const value = min + i * step;
      const percent = ((value - min) / range) * 100;
      const marker = document.createElement("div");
      marker.style.left = `${percent}%`;
      marker.textContent = `$${value}`;
      this.scaleElement.appendChild(marker);
    }
  }

  static initAll() {
    const fromSlider = document.querySelector("#fromSlider");
    const toSlider = document.querySelector("#toSlider");
    const fromTooltip = document.querySelector("#fromSliderTooltip");
    const toTooltip = document.querySelector("#toSliderTooltip");
    const scale = document.getElementById("scale");

    new CustomRangeSlider(fromSlider, toSlider, fromTooltip, toTooltip, scale);
  }
}

class ScrollToTopButton {
  constructor(buttonSelector, amountScrolled = 200, scrollDuration = 800) {
    this.button = document.querySelector(buttonSelector);
    this.amountScrolled = amountScrolled;
    this.scrollDuration = scrollDuration;

    this.init();
  }

  init() {
    window.addEventListener("scroll", () => this.handleScroll());
    this.button.addEventListener("click", (event) => this.scrollToTop(event));
  }

  handleScroll() {
    if (window.scrollY > this.amountScrolled) {
      this.button.classList.add("show");
    } else {
      this.button.classList.remove("show");
    }
  }

  scrollToTop(event) {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  static init(buttonSelector, amountScrolled = 200, scrollDuration = 800) {
    new ScrollToTopButton(buttonSelector, amountScrolled, scrollDuration);
  }
}

class TabsContent {
  constructor(selector) {
    this.container = document.querySelector(selector);
    this.links = [];
    this.list = null;
    this.previousSection = null;
    this.contentElements = this.container.querySelectorAll(".tab-content");
  }

  init() {
    this.createTabsFromContent();
    this.addEventListeners();
    this.contentElements[0].style.display = "block";
    this.contentElements[0].classList.add("tab-active")
  }

  showFirstActiveTab() {
    const hrefFromUrl = window.location.href
    const currentTabFromUrl = hrefFromUrl.split("#")[1];
  }

  addEventListeners() {
    this.links.forEach(link => {
      link.addEventListener("click", () => {
        this.contentElements.forEach(content => { 
          content.classList.remove("tab-active") 
          content.style.display = "none";

          if (link.href.split('#')[1] === content.id) {
            
            content.style.display = "block";

            setTimeout(() => {
              content.classList.add("tab-active")
            }, 0)
          }
        }); 
      })
    })
  }

  createTabsFromContent() {
    this.list = this.container.querySelector(".tabs-navigation-list");

    this.contentElements.forEach((content) => {
      const heading = content.querySelector(".tab-content-title");
      const li = document.createElement("li");
      const link = document.createElement("a");

      link.textContent = heading.textContent;
      link.classList.add("tab-link");

      if (content.id) {
        link.href = `#${content.id}`;
      } else {
        let slugByTextContent = slugify(heading.textContent);
        link.href = `#${slugByTextContent}`;
        content.id = slugByTextContent;
      }

      li.appendChild(link);
      this.list.appendChild(li);
      this.links.push(link);
    });
  }
}

// pomoc

function slugify(string = "", separator = "-") {
  return string
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, separator);
}
