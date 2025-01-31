console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a");

// const currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// if (currentLink) {
//   currentLink.classList.add("current");
// }

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'Resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/NGLYRY', title: 'Github' },
];

// Detect if we are on the home page using a class in the <html> element
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create the <nav> element and prepend it to the <body>
let nav = document.createElement('nav');
document.body.prepend(nav);

// Add links dynamically to the navigation menu
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URL for relative paths if we're not on the home page
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create link and add it to <nav>
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host != location.host) {
    a.target = "_blank"
  }
}
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="selector">
      <option value='light dark'>Automatic</option>
      <option value='light'>Light</option>
      <option value='dark'>Dark</option>
    </select>
  </label>`
);

const select = document.querySelector("#selector")

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value;
});

if ('colorScheme' in localStorage) {
  const savedTheme = localStorage.colorScheme;
  select.value = savedTheme;
  document.documentElement.style.setProperty('color-scheme', savedTheme)
}

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('It works?');
      return data; 


  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}
