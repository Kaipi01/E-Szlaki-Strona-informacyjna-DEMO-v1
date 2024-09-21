document.addEventListener("DOMContentLoaded", function () {
  CustomSelect.initAll();

  // Slider
  const s1 = new Slider("#places-slider");

  setInterval(() => {
    s1.next();
  }, 1000);

  // Scroll spy skrypt
  // linki są dynamicznie generowane na podstawie nagłówków posiadających klase "js-toc-title"
  const tableOfContents = new TableOfContents(
    "#our-mission-information .js-toc"
  );
  tableOfContents.init();
});

function Slider(target) {
  let index = 1;
  let isMoved = true;
  const speed = 1000; // ms
  const transform = "transform " + speed / 1000 + "s";
  let translate = (i) => "translateX(-" + 100 * i + "%)";

  const slider = document.querySelector(target);
  const sliderRects = slider.getClientRects()[0];
  slider.style["overflow"] = "hidden";

  const container = document.createElement("div");
  container.style["display"] = "flex";
  container.style["flex-direction"] = "row";
  container.style["width"] = sliderRects.width + "px";
  container.style["height"] = sliderRects.height + "px";
  container.style["transform"] = translate(index);

  let boxes = [].slice.call(slider.children);
  boxes = [].concat(boxes[boxes.length - 1], boxes, boxes[0]);

  const size = boxes.length;
  for (let i = 0; i < size; i++) {
    const box = boxes[i];
    box.style["flex"] = "none";
    box.style["flex-wrap"] = "wrap";
    box.style["height"] = "100%";
    box.style["width"] = "100%";
    container.appendChild(box.cloneNode(true));
  }

  container.addEventListener("transitionstart", function () {
    isMoved = false;
    setTimeout(() => {
      isMoved = true;
    }, speed);
  });
  container.addEventListener("transitionend", function () {
    if (index === size - 1) {
      index = 1;
      container.style["transition"] = "none";
      container.style["transform"] = translate(index);
    }

    if (index === 0) {
      index = size - 2;
      container.style["transition"] = "none";
      container.style["transform"] = translate(index);
    }
  });

  slider.innerHTML = "";
  slider.appendChild(container);

  return {
    move: function (i) {
      if (isMoved === true) {
        index = i;
        container.style["transition"] = transform;
        container.style["transform"] = translate(index);
      }
    },
    next: function () {
      if (isMoved === true) {
        index = (index + 1) % size;
        container.style["transition"] = transform;
        container.style["transform"] = translate(index);
      }
    },
    prev: function () {
      if (isMoved === true) {
        index = index === 0 ? index + size : index;
        index = (index - 1) % size;
        container.style["transition"] = transform;
        container.style["transform"] = translate(index);
      }
    },
  };
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
        let slugByTextContent = this.slugify(heading.textContent);
        link.href = `#${slugByTextContent}`;
        heading.id = slugByTextContent;
      }

      li.appendChild(link);
      this.list.appendChild(li);
      this.links.push(link);
    });
  }

  slugify(string = "", separator = "-") {
    return string
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, separator);
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
