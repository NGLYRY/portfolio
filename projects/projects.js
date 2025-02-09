import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

const projectsTitle = document.querySelector('.projects-title')

projectsTitle.textContent = `Projects (${projects.length})`;

renderProjects(projects, projectsContainer, 'h2');

let query = '';
let currentData = [];
let searchInput = document.querySelector('.searchBar');
let selectedIndex = -1;


function updateProjects() {
  // Filter projects based on the search query
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  
  // If a pie slice is selected (selectedIndex is not -1), filter by the selected year
  if (selectedIndex !== -1 && currentData[selectedIndex]) {
    let selectedYear = currentData[selectedIndex].label;
    filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
  }
  
  // Render the filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  
  // Save the newData globally for later use
  currentData = newData;
  
  // re-calculate slice generator, arc data, etc.
  let newarcGenerator = d3.arc().innerRadius(20).outerRadius(50);
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => newarcGenerator(d));
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Clear up previous paths and legends
  d3.select('svg').selectAll('path').remove();
  let newlegend = d3.select('.legend');
  newlegend.selectAll('li').remove();

  // Draw the pie chart paths
  let svg = d3.select('svg');
  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', 'wedge') // default class
      .on('click', () => {
        // Toggle selection: if already selected, deselect (set to -1), else select the clicked wedge.
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update classes on the slices
        svg.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'wedge selected' : 'wedge'));

        // Update classes on the legend items
        newlegend.selectAll('li')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

        // **Call updateProjects so the projects list is re-rendered immediately**
        updateProjects();
      });
  });

  // Draw the legend items
  newData.forEach((d, idx) => {
    newlegend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'block')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
  
  
  // Call this function on page load
  renderPieChart(projects);
  

  searchInput.addEventListener('change', (event) => {
    query = event.target.value;
    let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });