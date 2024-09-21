const motionQuery = window.matchMedia("(prefers-reduced-motion)");

function ready(fn) {
  document.addEventListener("DOMContentLoaded", fn, false);
}

ready(() => {
  const tableOfContents = new TableOfContents(
    "#our-mission-information .js-toc"
  );
  tableOfContents.init();
});

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

    this.links.forEach((link) => {
      link.addEventListener("click", this.handleLinkClick.bind(this));
    });
  }

  handleLinkClick(evt) {
    const currentLink = evt.target;

    // this.links.forEach((link) => {
    //   link.classList.remove("active");
    //   link.parentElement.classList.remove("list-li-hover")
    // });

    // currentLink.classList.add("active");
    // currentLink.parentElement.classList.add("list-li-hover")
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
      link.parentElement.classList.remove("list-li-hover")
    });

    if (firstVisibleLink) {
      firstVisibleLink.classList.add("active");
      firstVisibleLink.parentElement.classList.add("list-li-hover")
    }

    if (!firstVisibleLink && this.previousSection) {
      const currentLink = this.container.querySelector(`a[href="#${this.previousSection}"]`)
      
      currentLink.classList.add("active"); 
      currentLink.parentElement.classList.add("list-li-hover")
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

      link.textContent = heading.textContent

      if (heading.id) {
        link.href = `#${heading.id}`;
      } else {
        let slugByTextContent = this.slugify(heading.textContent)
        link.href = `#${slugByTextContent}`;
        heading.id = slugByTextContent
      }

      li.appendChild(link);
      this.list.appendChild(li);
      this.links.push(link);
    });
  }

  slugify(string="", separator="-") {
    return string
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, separator);
  }
}
