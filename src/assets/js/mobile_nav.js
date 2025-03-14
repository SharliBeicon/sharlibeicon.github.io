const barsButton = document.querySelector(".bars-button");
const buttonIcon = barsButton.querySelector("svg");
const menu = document.querySelector(".menu-container");
let isOpen = false;

barsButton.addEventListener("click", function () {
  isOpen = !isOpen;
  if (isOpen) {
    menu.classList.remove("hidden");
    buttonIcon.style.transform = "rotate(90deg)";
    setTimeout(() => {
      menu.classList.remove("translate-x-full");
      document.body.style.overflow = "hidden";
    }, 10);
  } else {
    menu.classList.add("translate-x-full");
    buttonIcon.style.transform = "";
    menu.addEventListener("transitionend", function handler() {
      menu.classList.add("hidden");
      document.body.style.overflow = "";
      menu.removeEventListener("transitionend", handler);
    });
  }
});

menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    isOpen = false;
    menu.classList.add("translate-x-full");
    buttonIcon.style.transform = "";
    menu.addEventListener("transitionend", function handler() {
      menu.classList.add("hidden");
      document.body.style.overflow = "";
      menu.removeEventListener("transitionend", handler);
    });
  }
});
