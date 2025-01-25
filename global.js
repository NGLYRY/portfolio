console.log("IT’S ALIVE!");

// Define the $$ function to select multiple elements
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2.1: Get an array of all nav links
const navLinks = $$("nav a");

// Step 2.2: Find the link to the current page
const currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

// Step 2.3: Add the 'current' class to the current page link
if (currentLink) {
  currentLink.classList.add("current");
}
