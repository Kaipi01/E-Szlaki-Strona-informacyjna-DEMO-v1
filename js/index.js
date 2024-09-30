document.addEventListener("DOMContentLoaded", function () {
  const themeTogglerBtn = document.querySelector("#toggle-theme-btn input");

  themeTogglerBtn.addEventListener("change", toggleTheme);

  //Scroll spy skrypt
  //linki są dynamicznie generowane na podstawie nagłówków posiadających klase "js-toc-title"
  new TableOfContents("#our-mission-information .js-toc").init();

  // Tabs skrypt
  // linki są dynamicznie generowane na podstawie nagłówków posiadających klase "tab-content-title"
  new TabsContent("#modules-and-tools .tabs").init();

  // Inicjacja wszystkich animowantych poziomych progress barów
  // animacja odpala się gdy użytkownik scrolluje do sekcji z 
  // progress barem (użycie Intersection Observer API)
  new AnimatedProgressBars(".animated-progress-per", 1000);

  new InteractiveTimeline(".date", ".controls", ".dates-wrap");

  new ContentScreens(
    "main-menu",
    "section-home",
    ".link-page",
    ".link-home",
    "profile-pic1",
    "profile-pic2"
  );

  ScrollToTopButton.init("#back-to-top-button");
  CustomSelect.initAll();
  CustomRangeSlider.initAll();

  // Inicjacja wszystkich animowantych kołowych progress barów z klasą "circular-progress-bar"
  // animacja odpala się gdy użytkownik scrolluje do sekcji z 
  // progress barem (użycie Intersection Observer API)
  CircularProgressBar.initAll();

  const slider = CustomSlider.init("#places-slider");
  const sliderPrevBtn = document.querySelector(
    "#places-slider-navigation .prev-btn"
  );
  const sliderNextBtn = document.querySelector(
    "#places-slider-navigation .next-btn"
  );

  sliderPrevBtn.addEventListener("click", () => slider.prev());
  sliderNextBtn.addEventListener("click", () => slider.next());
});

class ContentScreens {
  constructor(
    menuSelector,
    homeSelector,
    pageLinksSelector,
    homeLinkSelector,
    profilePic1Selector,
    profilePic2Selector
  ) {
    this.menu = document.getElementById(menuSelector);
    this.homeSection = document.getElementById(homeSelector);
    this.pageLinks = document.querySelectorAll(pageLinksSelector);
    this.homeLink = document.querySelector(homeLinkSelector);
    this.profilePic1 = document.getElementById(profilePic1Selector);
    this.profilePic2 = document.getElementById(profilePic2Selector);
    this.activeDate = 0;
    this.homeFlag = 0;
    this.linkPage = "";
    this.init();
  }

  init() {
    this.bindPageLinks();
    this.bindHomeLink();
  }

  pageOn() {
    this.menu.classList.add("main-menu-pgactive");
    this.homeSection.classList.add("vcard-body-pgactive");
    document.querySelector(".profileActive")?.classList.remove("profileActive");
    this.profilePic2.classList.add("profileActive");
    this.homeFlag = 1;
  }

  pageOff() {
    document
      .querySelector(".section-page-active")
      ?.classList.remove("section-page-active");
    this.menu.classList.remove("main-menu-pgactive");
    this.homeSection.classList.remove("vcard-body-pgactive");
    document.querySelector(".profileActive")?.classList.remove("profileActive");
    this.profilePic1.classList.add("profileActive");
    this.homeFlag = 0;
  }

  bindPageLinks() {
    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector(".menuActive")?.classList.remove("menuActive");
        link.classList.add("menuActive");
        this.linkPage = link.getAttribute("href");
        document
          .querySelector(".section-page-active")
          ?.classList.remove("section-page-active");
        document
          .querySelector(this.linkPage)
          ?.classList.add("section-page-active");
        this.pageOn();
      });
    });
  }

  bindHomeLink() {
    this.homeLink.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.homeFlag === 1) {
        document.querySelector(".menuActive")?.classList.remove("menuActive");
        event.target.classList.add("menuActive");
        this.pageOff();
      }
    });
  }
}

class InteractiveTimeline {
  constructor(dateSelector, controlsSelector, datesWrapSelector) {
    this.dateElements = document.querySelectorAll(dateSelector);
    this.dateWidth =
      this.dateElements.length > 0 ? this.dateElements[0].offsetWidth : 0;
    this.activeDate = 0;
    this.noDates = this.dateElements.length;
    this.datesWrap = document.querySelector(datesWrapSelector);
    this.controlElements = document.querySelectorAll(controlsSelector);

    this.init();
  }

  init() {
    this.bindDateClick();
    this.bindControlClick();
  }

  changeDate(index) {
    if (index < 0) {
      this.activeDate = 0;
      return;
    }

    if (index > this.noDates - 1) {
      this.activeDate = this.noDates - 1;
      return;
    }

    this.dateElements.forEach((date) =>
      date.classList.remove("active", "sibling")
    );

    this.dateElements[index].classList.add("active");

    if (this.dateElements[index].previousElementSibling) {
      this.dateElements[index].previousElementSibling.classList.add("sibling");
    }

    this.datesWrap.style.transform = `translateX(${-this.dateWidth * index}px)`;
  }

  bindDateClick() {
    this.dateElements.forEach((date, index) => {
      date.addEventListener("click", () => {
        if (index === this.activeDate) return;

        this.activeDate = index;
        this.changeDate(this.activeDate);
      });
    });
  }

  bindControlClick() {
    this.controlElements.forEach((control) => {
      control.addEventListener("click", () => {
        const direction = parseInt(control.getAttribute("data-direction"), 10);
        this.activeDate += direction;
        this.changeDate(this.activeDate);
      });
    });
  }
}

class AnimatedProgressBars {
  constructor(selector, duration = 1000) {
    this.elements = document.querySelectorAll(selector);
    this.duration = duration;
    this.observer = null; // Obiekt IntersectionObserver
    this.initObserver();
  }

  initObserver() {
    const options = {
      root: null, // Przecięcie z obszarem widoku (viewport)
      rootMargin: "0px",
      threshold: 0.1, // Procent widoczności elementu (0.1 oznacza 10% widoczności)
    };

    // Funkcja callback dla IntersectionObserver
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Gdy element jest widoczny w viewport
          this.animateElement(entry.target);
          observer.unobserve(entry.target); // Przestajemy obserwować element po animacji
        }
      });
    }, options);

    // Dodanie obserwacji dla wszystkich elementów
    this.elements.forEach((element) => {
      this.observer.observe(element);
    });
  }

  animateElement(element) {
    const per = element.getAttribute("per");
    element.style.width = "0%"; // Start od 0%

    let startValue = { animatedValue: 0 };
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / this.duration, 1); // Zakres 0 - 1
      const animatedValue = percentage * per;

      element.style.width = Math.floor(animatedValue) + "%";
      element.setAttribute("per", Math.floor(animatedValue) + "%");

      if (progress < this.duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.width = per + "%"; // Upewnienie się, że animacja zakończyła się na pełnej wartości
        element.setAttribute("per", Math.floor(per) + "%");
      }
    };

    requestAnimationFrame(animate);
  }
}

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
    //this.container.style.width = `${sliderRects.width}px`;
    //this.container.style.height = `${sliderRects.height}px`;
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
    this.showFirstActiveTab();
  }

  showFirstActiveTab() {
    const hrefFromUrl = window.location.href;
    const currentHref = hrefFromUrl.split("#")[1];

    if (currentHref) {
      this.toggleContent(currentHref);
    } else {
      this.toggleContent(this.links[0]?.href.split("#")[1], false);
    }
  }

  hideContent(content) {
    content.classList.remove("tab-active");
    content.style.position = "absolute";
    content.style.left = "0";
    content.style.top = "0";

    setTimeout(() => {
      content.style.display = "none";
      content.style.position = "static";
      content.style.left = "auto";
      content.style.top = "auto";
    }, 300);
  }
  showContent(content) {
    content.style.display = "block";

    setTimeout(() => {
      content.classList.add("tab-active");
    }, 0);
  }

  toggleContent(contentHref, isHistoryStateMustReplace = true) {
    if (isHistoryStateMustReplace) {
      history.replaceState(null, null, "#" + contentHref);
    }

    this.links.forEach((link) => link.classList.remove("tab-link-active"));

    const activeTabLink = this.container.querySelector(
      `.tab-link[href="#${contentHref}"]`
    );
    activeTabLink.classList.add("tab-link-active");

    this.contentElements.forEach((content) => {
      contentHref === content.id
        ? this.showContent(content)
        : this.hideContent(content);
    });
  }

  addEventListeners() {
    this.links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleContent(link.href.split("#")[1]);
      });
    });
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

class CircularProgressBar {
  static DEFAULT_OPTIONS = {
    colorSlice: "#00a1ff",
    fontColor: "#000",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineargradient: false,
    number: true,
    round: false,
    fill: "none",
    unit: "%",
    rotation: -90,
    size: 200,
    stroke: 10,
  };

  constructor(pieName, globalObj = {}) {
    this._className = pieName;
    this._globalObj = globalObj;

    const pieElements = document.querySelectorAll(`.${pieName}`);
    const elements = [].slice.call(pieElements);
    // add index to all progressbar
    elements.map((item, idx) => {
      const id = JSON.parse(item.getAttribute("data-pie"));
      item.setAttribute(
        "data-pie-index",
        id.index || globalObj.index || idx + 1
      );
    });

    this._elements = elements;
  }

  static initAll() {
    const pie = document.querySelectorAll(".pie");
    const elements = [].slice.call(pie);
    const circle = new CircularProgressBar("pie");

    if ("IntersectionObserver" in window) {
      const config = {
        root: null,
        rootMargin: "0px",
        threshold: 0.75,
      };

      const ovserver = new IntersectionObserver((entries, observer) => {
        entries.map((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.75) {
            circle.initial(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, config);

      elements.map((item) => {
        ovserver.observe(item);
      });
    } else {
      elements.map((element) => {
        circle.initial(element);
      });
    }
  }

  initial(outside) {
    const triggeredOutside = outside || this._elements;
    Array.isArray(triggeredOutside)
      ? triggeredOutside.map((element) => this._createSVG(element))
      : this._createSVG(triggeredOutside);
  }

  _progress(svg, target, options) {
    const pieName = this._className;
    if (options.number) {
      this._insertAdElement(svg, this._percent(options, pieName));
    }

    const progressCircle = this._querySelector(
      `.${pieName}-circle-${options.index}`
    );

    const configCircle = {
      fill: "none",
      "stroke-width": options.stroke,
      "stroke-dashoffset": "264",
      ...this._strokeDasharray(),
      ...this._strokeLinecap(options),
    };
    this._setAttribute(progressCircle, configCircle);

    // animation progress
    this.animationTo({ ...options, element: progressCircle }, true);

    // set style and rotation
    progressCircle.setAttribute("style", this._styleTransform(options));

    // set color
    this._setColor(progressCircle, options);

    // set width and height on div
    target.setAttribute(
      "style",
      `width:${options.size}px;height:${options.size}px;`
    );
  }

  animationTo(options, initial = false) {
    const pieName = this._className;
    const previousConfigObj = JSON.parse(
      this._querySelector(`[data-pie-index="${options.index}"]`).getAttribute(
        "data-pie"
      )
    );

    const circleElement = this._querySelector(
      `.${pieName}-circle-${options.index}`
    );

    if (!circleElement) return;

    // merging all configuration objects
    const commonConfiguration = initial
      ? options
      : {
          ...CircularProgressBar.DEFAULT_OPTIONS,
          ...previousConfigObj,
          ...options,
          ...this._globalObj,
        };

    // update color circle
    if (!initial) {
      this._setColor(circleElement, commonConfiguration);
    }

    // font color update
    if (!initial && commonConfiguration.number) {
      const fontconfig = {
        fill: commonConfiguration.fontColor,
        ...this._fontSettings(commonConfiguration),
      };
      const textElement = this._querySelector(
        `.${pieName}-text-${commonConfiguration.index}`
      );
      this._setAttribute(textElement, fontconfig);
    }

    const centerNumber = this._querySelector(
      `.${pieName}-percent-${options.index}`
    );

    if (commonConfiguration.animationOff) {
      if (commonConfiguration.number)
        centerNumber.textContent = `${commonConfiguration.percent}`;
      circleElement.setAttribute(
        "stroke-dashoffset",
        this._dashOffset(
          commonConfiguration.percent *
            ((100 - (commonConfiguration.cut || 0)) / 100),
          commonConfiguration.inverse
        )
      );
      return;
    }

    // get numer percent from data-angel
    let angle = JSON.parse(circleElement.getAttribute("data-angel"));

    // round if number is decimal
    const percent = Math.round(options.percent);

    // if percent 0 then set at start 0%
    if (percent === 0) {
      if (commonConfiguration.number) centerNumber.textContent = "0";
      circleElement.setAttribute("stroke-dashoffset", "264");
    }

    if (percent > 100 || percent < 0 || angle === percent) return;

    let request;
    let i = initial ? 0 : angle;

    const fps = commonConfiguration.speed || 1000;
    const interval = 1000 / fps;
    const tolerance = 0.1;
    let then = performance.now();

    const performAnimation = (now) => {
      request = requestAnimationFrame(performAnimation);
      const delta = now - then;

      if (delta >= interval - tolerance) {
        then = now - (delta % interval);

        // angle >= commonConfiguration.percent ? i-- : i++;
        i = i < commonConfiguration.percent ? i + 1 : i - 1;
      }

      circleElement.setAttribute(
        "stroke-dashoffset",
        this._dashOffset(
          i,
          commonConfiguration.inverse,
          commonConfiguration.cut
        )
      );
      if (centerNumber && commonConfiguration.number) {
        centerNumber.textContent = `${i}`;
      }

      circleElement.setAttribute("data-angel", i);
      circleElement.parentNode.setAttribute("aria-valuenow", i);

      if (i === percent) {
        cancelAnimationFrame(request);
      }

      // return;
    };

    requestAnimationFrame(performAnimation);
  }

  _createSVG(element) {
    const index = element.getAttribute("data-pie-index");
    const json = JSON.parse(element.getAttribute("data-pie"));

    const options = {
      ...CircularProgressBar.DEFAULT_OPTIONS,
      ...json,
      index,
      ...this._globalObj,
    };

    const svg = this._createNSElement("svg");

    const configSVG = {
      role: "progressbar",
      width: options.size,
      height: options.size,
      viewBox: "0 0 100 100",
      "aria-valuemin": "0",
      "aria-valuemax": "100",
    };

    this._setAttribute(svg, configSVG);

    // colorCircle
    if (options.colorCircle) {
      svg.appendChild(this._circle(options));
    }

    // gradient
    if (options.lineargradient) {
      svg.appendChild(this._gradient(options));
    }

    svg.appendChild(this._circle(options, "top"));

    element.appendChild(svg);

    this._progress(svg, element, options);
  }

  _circle(options, where = "bottom") {
    const circle = this._createNSElement("circle");

    let configCircle = {};
    if (options.cut) {
      const dashoffset = 264 - (100 - options.cut) * 2.64;
      configCircle = {
        "stroke-dashoffset": options.inverse ? -dashoffset : dashoffset,
        style: this._styleTransform(options),
        ...this._strokeDasharray(),
        ...this._strokeLinecap(options),
      };
    }

    const objCircle = {
      fill: options.fill,
      stroke: options.colorCircle,
      "stroke-width": options.strokeBottom || options.stroke,
      ...configCircle,
    };

    if (options.strokeDasharray) {
      Object.assign(objCircle, {
        ...this._strokeDasharray(options.strokeDasharray),
      });
    }

    const typeCircle =
      where === "top"
        ? { class: `${this._className}-circle-${options.index}` }
        : objCircle;

    const objConfig = {
      cx: "50%",
      cy: "50%",
      r: 42,
      "shape-rendering": "geometricPrecision",
      ...typeCircle,
    };

    this._setAttribute(circle, objConfig);

    return circle;
  }

  _styleTransform = ({ rotation, animationSmooth }) => {
    const smoothAnimation = animationSmooth
      ? `transition: stroke-dashoffset ${animationSmooth}`
      : "";

    return `transform:rotate(${rotation}deg);transform-origin: 50% 50%;${smoothAnimation}`;
  };
  _strokeDasharray = (type) => {
    return {
      "stroke-dasharray": type || "264",
    };
  };
  _strokeLinecap = ({ round }) => {
    return {
      "stroke-linecap": round ? "round" : "",
    };
  };
  _fontSettings = (options) => {
    return {
      "font-size": options.fontSize,
      "font-weight": options.fontWeight,
    };
  };
  _querySelector = (element) => document.querySelector(element);

  _setColor = (element, { lineargradient, index, colorSlice }) => {
    element.setAttribute(
      "stroke",
      lineargradient ? `url(#linear-${index})` : colorSlice
    );
  };

  _setAttribute = (element, object) => {
    for (const key in object) {
      element?.setAttribute(key, object[key]);
    }
  };

  _createNSElement = (type) =>
    document.createElementNS("http://www.w3.org/2000/svg", type);

  _tspan = (className, unit) => {
    const element = this._createNSElement("tspan");

    element.classList.add(className);
    if (unit) element.textContent = unit;
    return element;
  };

  _dashOffset = (count, inverse, cut) => {
    const cutChar = cut ? (264 / 100) * (100 - cut) : 264;
    const angle = 264 - (count / 100) * cutChar;

    return inverse ? -angle : angle;
  };

  _insertAdElement = (element, el, type = "beforeend") =>
    element.insertAdjacentElement(type, el);

  _gradient = ({ index, lineargradient }) => {
    const defsElement = this._createNSElement("defs");
    const linearGradient = this._createNSElement("linearGradient");
    linearGradient.id = `linear-${index}`;

    const countGradient = [].slice.call(lineargradient);

    defsElement.appendChild(linearGradient);

    let number = 0;
    countGradient.map((item) => {
      const stopElements = this._createNSElement("stop");

      const stopObj = {
        offset: `${number}%`,
        "stop-color": `${item}`,
      };
      this._setAttribute(stopElements, stopObj);

      linearGradient.appendChild(stopElements);
      number += 100 / (countGradient.length - 1);
    });

    return defsElement;
  };

  _percent = (options, className) => {
    const creatTextElementSVG = this._createNSElement("text");

    creatTextElementSVG.classList.add(`${className}-text-${options.index}`);

    // create tspan element with number
    // and insert to svg text element
    this._insertAdElement(
      creatTextElementSVG,
      this._tspan(`${className}-percent-${options.index}`)
    );

    // create and insert unit to text element
    this._insertAdElement(
      creatTextElementSVG,
      this._tspan(`${className}-unit-${options.index}`, options.unit)
    );

    // config to svg text
    const obj = {
      x: "50%",
      y: "50%",
      fill: options.fontColor,
      "text-anchor": "middle",
      dy: options.textPosition || "0.35em",
      ...this._fontSettings(options),
    };

    this._setAttribute(creatTextElementSVG, obj);
    return creatTextElementSVG;
  };
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

function toggleTheme() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
  }
}